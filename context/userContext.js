'use client'
import React, { useContext, createContext, useEffect, useState } from 'react'

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser === 'sujal' || storedUser === 'pankaj') {
            setLoading(false);
            setUser(storedUser);
        } else {
            setLoading(false);
            setShowPopup(true)
        }
    }, [])

    const selectUser = (selectedUser) => {
        console.log(selectedUser)
        if (selectedUser === 'sujal' || selectedUser === 'pankaj') {
            console.log(selectedUser)
            localStorage.setItem('user', selectedUser);
            setUser(selectedUser);
            setShowPopup(false);
        }
    };

    if (loading) return (
        <div className='flex justify-center items-center h-screen w-screen'>
            Loading...
        </div>
    )

    return (
        <UserContext.Provider value={{ user, setUser, selectUser }}>
            {children}
            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl mb-4">Who are you?</h2>
                        <div className="flex gap-4">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={() => selectUser('sujal')}
                            >
                                Sujal
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={() => selectUser('pankaj')}
                            >
                                Pankaj
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UserContext.Provider>
    )
}


export const useUser = () => useContext(UserContext)