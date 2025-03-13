"use client";

import { createContext, useContext, useState } from "react";
import * as Toast from "@radix-ui/react-toast";

// Create a Context for Toast Notifications
const ToastContext = createContext();

// ToastProvider to manage the toasts globally
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Function to add a new toast with title and description
  const addToast = ({ title = "Notification", description = "" }) => {
    setToasts((prev) => [
      ...prev,
      { id: Date.now(), title, description }
    ]);
  };
  
  // Function to remove a toast by id
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      <Toast.Provider swipeDirection="right">
        {children}
        <Toast.Viewport className="fixed top-0 right-0 mt-5 mr-5 space-y-2 max-w-[300px] z-50">
          {toasts.map((toast) => (
            toast?.title ? (
              <Toast.Root 
                key={toast.id} 
                className="bg-black text-white p-4 rounded-md shadow-md"
                onOpenChange={(open) => {
                  if (!open) removeToast(toast.id);
                }}
              >
                <Toast.Title className="font-medium">{String(toast.title)}</Toast.Title>
                {toast.description && (
                  <Toast.Description className="text-sm">{String(toast.description)}</Toast.Description>
                )}
                <Toast.Action
                  className="absolute top-2 right-2 text-white cursor-pointer"
                  onClick={() => removeToast(toast.id)}
                  altText="Close"
                >
                  X
                </Toast.Action>
              </Toast.Root>
            ) : null
          ))}
        </Toast.Viewport>
      </Toast.Provider>
    </ToastContext.Provider>
  );
};

// Custom hook to access the Toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};