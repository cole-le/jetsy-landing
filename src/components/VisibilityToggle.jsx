import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getApiBaseUrl } from '../config/environment';
import { useAuth } from './auth/AuthProvider';

const VisibilityToggle = ({ project, onVisibilityChange, className = "" }) => {
  const { session } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentVisibility, setCurrentVisibility] = useState(project?.visibility || 'private');
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 192 }); // width ~ w-48

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute dropdown position relative to the button (use fixed so it's not clipped)
  const computePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const width = 192; // px for w-48
    let left = rect.right - width; // right align with button
    const margin = 8;
    // keep within viewport
    left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
    const top = Math.min(
      rect.bottom + 6,
      window.innerHeight - margin - 10 // keep some space at bottom
    );
    setDropdownPos({ top, left, width });
  };

  useEffect(() => {
    if (!isOpen) return;
    computePosition();
    const onScroll = () => computePosition();
    const onResize = () => computePosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen]);

  // Update visibility when project prop changes
  useEffect(() => {
    setCurrentVisibility(project?.visibility || 'private');
  }, [project?.visibility]);

  const updateVisibility = async (newVisibility) => {
    if (!project?.id || !session?.access_token || isUpdating) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/projects/${project.id}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ visibility: newVisibility })
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentVisibility(newVisibility);
        setIsOpen(false);
        
        // Notify parent component of the change
        if (onVisibilityChange) {
          onVisibilityChange(project.id, newVisibility);
        }
      } else {
        console.error('Failed to update project visibility:', response.status);
      }
    } catch (error) {
      console.error('Error updating project visibility:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getVisibilityIcon = (visibility) => {
    if (visibility === 'public') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    }
  };

  const getVisibilityColor = (visibility) => {
    return visibility === 'public' 
      ? 'text-green-600 bg-green-50 border-green-200' 
      : 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const dropdownMenu = (
    <div
      ref={dropdownRef}
      className="bg-white rounded-md shadow-lg border border-gray-200 z-[9999]"
      style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
    >
      <div className="py-1">
        <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
          Project Visibility
        </div>
        <button
          onClick={() => updateVisibility('private')}
          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
            currentVisibility === 'private' ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <div className="font-medium">Private</div>
            <div className="text-xs text-gray-500">Only you can access this project</div>
          </div>
        </button>
        <button
          onClick={() => updateVisibility('public')}
          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
            currentVisibility === 'public' ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-medium">Public</div>
            <div className="text-xs text-gray-500">Anyone can view and remix this project</div>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={isUpdating}
        className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-md border transition-colors ${getVisibilityColor(currentVisibility)} hover:opacity-80 disabled:opacity-50`}
        title={`Project is ${currentVisibility}. Click to change visibility.`}
      >
        {getVisibilityIcon(currentVisibility)}
        <span className="capitalize">
          {isUpdating ? 'Updating...' : `${currentVisibility}`}
        </span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && !isUpdating && createPortal(dropdownMenu, document.body)}
    </div>
  );
};

export default VisibilityToggle;
