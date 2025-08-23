import React, { useState } from 'react';
import { supabase } from '../../config/supabase';

const NameCaptureModal = ({ isOpen, onCompleted }) => {
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) {
      setError('Please enter your name');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() }
      });
      if (error) {
        setError(error.message);
      } else {
        if (onCompleted) onCompleted(fullName.trim());
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Name capture error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold text-text mb-2">What is your name?</h3>
        <p className="text-sm text-mutedText mb-4">We'll use this to personalize your experience.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={`input-field w-full ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Enter your full name"
            autoFocus
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full btn btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NameCaptureModal;
