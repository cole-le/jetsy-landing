import React, { useState, useEffect } from 'react'
import { trackEvent } from '../utils/analytics'

const FAQ = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in the FAQ section
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const faqData = [
    {
      question: "What is a credit?",
      answer: "Each message with Jetsy while you chat with it to make it build the landing page or the ads costs 1 credit."
    },
    {
      question: "What is the infrastructure of my website?",
      answer: "Your website will be designed with React and hosted on Cloudflare Pages, optimized for beautiful design and speed."
    },
    {
      question: "Can I decide the design of my website and ads?",
      answer: "Yes, you can. You can decide and change the design of your website and ads live as you chat with Jetsy. You will have a chat bar on the left side, and on the right side, you will see the live preview of your website and ads being created by Jetsy."
    },
    {
      question: "What AI models does Jetsy use?",
      answer: "Jetsy currently uses a mix of AI models from OpenAI, Gemini, and Anthropic. We are working to let you choose which model you use for your chat with Jetsy."
    }
  ]

  return (
    <section className="min-h-screen flex items-start justify-center px-4 pt-20 pb-12 relative lovable-gradient">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        


        {/* Headline */}
        <h1 className={`text-3xl md:text-5xl font-bold mb-6 mt-12 md:mt-24 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          Frequently Asked Questions
        </h1>

        {/* Subheadline */}
        <p className={`text-lg md:text-xl text-mutedText mb-12 max-w-3xl mx-auto leading-relaxed font-medium transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          Everything you need to know about Jetsy
        </p>

        {/* FAQ Items */}
        <div className={`space-y-6 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {faqData.map((item, index) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-lg rounded-xl p-6 md:p-8 shadow-sm border border-gray-200/50 text-left"
            >
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-text">
                {item.question}
              </h3>
              <p className="text-mutedText leading-relaxed text-lg">
                {item.answer}
              </p>
            </div>
          ))}
        </div>


      </div>
    </section>
  )
}

export default FAQ 