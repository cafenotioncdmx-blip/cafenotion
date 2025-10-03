"use client";

import { useState } from "react";

interface Order {
  id: string;
  first_name: string;
  last_name: string;
  drink: string;
  pickup_code: string;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  order: Order | null;
  isDeleting: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  order,
  isDeleting,
}: DeleteConfirmationModalProps) {
  const [step, setStep] = useState(1);

  if (!isOpen || !order) return null;

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConfirm = () => {
    onConfirm();
    setStep(1);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Step 1: Initial delete confirmation */}
          {step === 1 && (
            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                Delete Order
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to delete this order? This action will
                remove it from the admin view.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleClose}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNext}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Show user details */}
          {step === 2 && (
            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                Confirm Deletion
              </h3>
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <p className="text-sm text-gray-700 text-center">
                  <strong>
                    {order.first_name} {order.last_name}
                  </strong>{" "}
                  will be deleted
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Order: {order.drink} • Code: {order.pickup_code}
                </p>
              </div>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleBack}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Final confirmation */}
          {step === 3 && (
            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                Final Confirmation
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to delete this order? The user will be
                deleted forever from the admin view.
                <br />
                <strong className="text-red-600">
                  This action cannot be undone.
                </strong>
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleBack}
                  disabled={isDeleting}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isDeleting}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete Forever"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
