import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  increment,
} from "firebase/firestore";
import { auth, db, provider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { FaGoogle, FaSignOutAlt, FaVoteYea } from "react-icons/fa";

function App() {
  const [options, setOptions] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Real-time data subscription
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "options"), (snapshot) => {
      const optionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOptions(optionsData);
    });

    return () => unsubscribe();
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleVote = async (optionId) => {
    if (!user || hasVoted) return;

    const optionRef = doc(db, "options", optionId);
    await updateDoc(optionRef, {
      votes: increment(1),
    });

    setSelectedOption(optionId);
    setHasVoted(true);
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
    setHasVoted(false);
    setSelectedOption(null);
  };

  // Calculate total votes for percentages
  const totalVotes = options.reduce(
    (sum, option) => sum + (option.votes || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Live Vote</h1>
          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              <FaSignOutAlt /> Sign Out
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              <FaGoogle /> Sign In to Vote
            </button>
          )}
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Vote for your favorite</h2>

          <AnimatePresence>
            {options.map((option) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${
                    selectedOption === option.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }
                  ${hasVoted ? "cursor-default" : "cursor-pointer"}`}
                onClick={() => handleVote(option.id)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{option.name}</h3>
                  {hasVoted && (
                    <span className="text-sm font-semibold">
                      {Math.round((option.votes / totalVotes) * 100 || 0)}%
                    </span>
                  )}
                </div>

                {hasVoted && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(option.votes / totalVotes) * 100}%` }}
                    transition={{ duration: 1, type: "spring" }}
                    className={`h-2 mt-2 rounded-full 
                      ${
                        selectedOption === option.id
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {user && !hasVoted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mt-4 text-blue-600"
            >
              <FaVoteYea /> Click to vote!
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
