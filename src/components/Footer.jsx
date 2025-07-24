import React from 'react'

function Footer() {
  return (
    <footer className="py-6 text-center text-mutedText">
      <p className="text-sm">
        Jetsy © 2025, created by{' '}
        <a 
          href="https://www.linkedin.com/in/cole-le/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline transition-colors"
        >
          Cole Le
        </a>
      </p>
    </footer>
  )
}

export default Footer 