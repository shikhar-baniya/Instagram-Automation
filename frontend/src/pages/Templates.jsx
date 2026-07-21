import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const templatesData = [
  {
    id: 1,
    category: 'Popular',
    title: 'Send link on keyword',
    description: 'Someone comments "LINK" -> they get your link in DMs.',
    userMessage: 'Need the LINK please!',
    botReplyText: 'Here\'s your link!',
    botButtonText: 'Shop the look →',
    templateData: {
      target_post_type: 'any',
      match_type: 'exact',
      trigger_keyword: 'LINK',
      public_reply_text: 'Sent you a DM with the link! 💌',
      opening_message: 'Here is the link you asked for!',
      button_text: 'Shop the look',
      main_button_text: 'Shop the look',
      main_button_url: 'https://yourwebsite.com/product',
      response_message: 'Thank you for your interest!'
    }
  },
  {
    id: 2,
    category: 'Popular',
    title: 'Require follow before link',
    description: 'Ask them to follow you first. Grow your audience with every link.',
    userMessage: 'LINK please!',
    botReplyText: 'Follow me first!',
    botButtonText: 'I\'m following',
    templateData: {
      target_post_type: 'any',
      match_type: 'exact',
      trigger_keyword: 'LINK',
      public_reply_text: 'Check your DMs! 💌',
      require_follow: true,
      opening_message: 'Please follow our page to receive the link, then tap the button below!',
      button_text: 'I\'m following',
      main_button_text: 'Here is the link',
      main_button_url: 'https://yourwebsite.com/product',
      response_message: 'Thanks for following! Here is your link.'
    }
  },
  {
    id: 5,
    category: 'Engage audience',
    title: 'Thank story reactors',
    description: 'Someone reacts to your story -> thank them with a personal DM.',
    userMessage: 'reacted to your story',
    botReplyText: 'Thanks for the love! Want to see more?',
    botButtonText: 'See more →',
    templateData: {
      target_post_type: 'any',
      match_type: 'any',
      trigger_keyword: '',
      response_message: 'Thanks for the love! Want to see more?',
      button_text: 'See more',
      main_button_text: 'See more',
      main_button_url: 'https://yourwebsite.com/more'
    }
  },
  {
    id: 6,
    category: 'Engage audience',
    title: 'Thank commenters',
    description: 'Someone comments a keyword -> send a thank you DM automatically.',
    userMessage: 'Love this! AMAZING content!',
    botReplyText: 'Thanks so much! Means a lot!',
    botButtonText: 'Thanks! →',
    templateData: {
      target_post_type: 'any',
      match_type: 'any',
      trigger_keyword: '',
      response_message: 'Thanks so much! Means a lot!',
      button_text: 'Thanks!'
    }
  },
  {
    id: 7,
    category: 'Engage audience',
    title: 'Start conversations',
    description: 'Someone comments a keyword -> start a real conversation in DMs.',
    userMessage: 'Tell me MORE about this!',
    botReplyText: 'Hey! What would you like to know?',
    botButtonText: 'Chat →',
    templateData: {
      target_post_type: 'any',
      match_type: 'partial',
      trigger_keyword: 'more',
      response_message: 'Hey! What would you like to know?',
      button_text: 'Chat'
    }
  },
  {
    id: 3,
    category: 'Sell & earn',
    title: 'Share affiliate links',
    description: 'Auto-send your LTK, Amazon, or ShopMy links when someone comments a keyword.',
    userMessage: 'Where\'s the LINK?',
    botReplyText: 'Here\'s my LTK link!',
    botButtonText: 'Shop on LTK →',
    templateData: {
      target_post_type: 'any',
      match_type: 'partial',
      trigger_keyword: 'link',
      public_reply_text: 'Sent to your DMs! 💌',
      opening_message: 'Here is my LTK link as requested!',
      button_text: 'Shop on LTK',
      main_button_text: 'Shop on LTK',
      main_button_url: 'https://liketoknow.it/...',
      response_message: 'Happy shopping!'
    }
  },
  {
    id: 4,
    category: 'Sell & earn',
    title: 'Send discount codes',
    description: 'Someone comments "CODE" -> they get an exclusive discount in DMs.',
    userMessage: 'Drop the CODE!',
    botReplyText: 'Here\'s 20% off just for you!',
    botButtonText: 'SAVE20',
    templateData: {
      target_post_type: 'any',
      match_type: 'exact',
      trigger_keyword: 'CODE',
      public_reply_text: 'Check your DMs for the code! 🎁',
      response_message: 'Here is your 20% off discount code: SAVE20. Enjoy! 🎉'
    }
  },
  {
    id: 8,
    category: 'Capture leads',
    title: 'Deliver lead magnets',
    description: 'Someone comments "FREE" -> they get your PDF, checklist, or guide.',
    userMessage: 'I need the FREE guide!',
    botReplyText: 'Your free guide is ready!',
    botButtonText: 'Download PDF',
    templateData: {
      target_post_type: 'any',
      match_type: 'exact',
      trigger_keyword: 'FREE',
      public_reply_text: 'Sent the guide to your DMs!',
      response_message: 'Your free guide is ready!',
      main_button_text: 'Download PDF',
      main_button_url: 'https://yourwebsite.com/guide.pdf'
    }
  },
  {
    id: 9,
    category: 'Capture leads',
    title: 'Collect emails first',
    description: 'Someone comments "GUIDE" -> ask for email, then send content.',
    userMessage: 'Send me the GUIDE!',
    botReplyText: 'Drop your email and I\'ll send it!',
    botButtonText: 'Send email →',
    templateData: {
      target_post_type: 'any',
      match_type: 'exact',
      trigger_keyword: 'GUIDE',
      public_reply_text: 'Check your DMs!',
      response_message: 'Drop your email below and I\'ll send the guide over immediately!'
    }
  },
  {
    id: 10,
    category: 'Capture leads',
    title: 'Grow your waitlist',
    description: 'Someone comments "WAITLIST" -> they get your signup link.',
    userMessage: 'Add me to the WAITLIST!',
    botReplyText: 'You\'re in! Here\'s the waitlist:',
    botButtonText: 'Join waitlist →',
    templateData: {
      target_post_type: 'any',
      match_type: 'exact',
      trigger_keyword: 'WAITLIST',
      public_reply_text: 'Sent the waitlist link to your DMs!',
      response_message: 'You\'re in! Here\'s the waitlist:',
      main_button_text: 'Join waitlist',
      main_button_url: 'https://yourwebsite.com/waitlist'
    }
  },
  {
    id: 11,
    category: 'Book clients',
    title: 'Send booking links',
    description: 'Someone comments "BOOK" -> they get your Calendly or booking page automatically.',
    userMessage: 'Can I BOOK a call?',
    botReplyText: 'Pick a time that works!',
    botButtonText: 'Book now →',
    templateData: {
      target_post_type: 'any',
      match_type: 'exact',
      trigger_keyword: 'BOOK',
      public_reply_text: 'Sent my booking link to your DMs!',
      response_message: 'Awesome! Pick a time that works for you here:',
      main_button_text: 'Book now',
      main_button_url: 'https://calendly.com/your-link'
    }
  },
  {
    id: 12,
    category: 'Book clients',
    title: 'Share your portfolio',
    description: 'Someone comments "WORK" -> they get your portfolio link in DMs.',
    userMessage: 'Show me your WORK!',
    botReplyText: 'Here\'s my portfolio!',
    botButtonText: 'View portfolio →',
    templateData: {
      target_post_type: 'any',
      match_type: 'exact',
      trigger_keyword: 'WORK',
      public_reply_text: 'Sent my portfolio to your DMs!',
      response_message: 'Here\'s a link to my recent work!',
      main_button_text: 'View portfolio',
      main_button_url: 'https://yourwebsite.com/portfolio'
    }
  },
  {
    id: 13,
    category: 'Book clients',
    title: 'Promote webinars',
    description: 'Someone comments "REGISTER" -> they get your webinar signup link.',
    userMessage: 'I want to REGISTER!',
    botReplyText: 'You\'re in! Here\'s the link:',
    botButtonText: 'Register now →',
    templateData: {
      target_post_type: 'any',
      match_type: 'exact',
      trigger_keyword: 'REGISTER',
      public_reply_text: 'Sent the registration link to your DMs!',
      response_message: 'You\'re in! Here is the registration link:',
      main_button_text: 'Register now',
      main_button_url: 'https://yourwebsite.com/webinar'
    }
  },
  {
    id: 14,
    category: 'Book clients',
    title: 'Share your content',
    description: 'Someone comments "VIDEO" -> they get your YouTube or podcast link.',
    userMessage: 'Send me the VIDEO!',
    botReplyText: 'Here\'s the full video!',
    botButtonText: 'Watch on YouTube →',
    templateData: {
      target_post_type: 'any',
      match_type: 'exact',
      trigger_keyword: 'VIDEO',
      public_reply_text: 'Sent the video link to your DMs!',
      response_message: 'Here\'s the full video! Let me know what you think.',
      main_button_text: 'Watch on YouTube',
      main_button_url: 'https://youtube.com/your-video'
    }
  }
];

const categories = ["All", "Featured", "Engage audience", "Sell & earn", "Capture leads", "Book clients"];

export default function Templates() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");

  const handleTemplateClick = (template) => {
    navigate('/new-automation', { state: { template: template.templateData } });
  };

  const renderCard = (template) => (
    <div 
      key={template.id} 
      className="macos-glass-panel border border-white/5 rounded-3xl p-6 hover:border-white/20 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col shadow-sm"
      onClick={() => handleTemplateClick(template)}
    >
      <h3 className="font-bold text-lg mb-2 text-white/90 group-hover:text-blue-400 transition-colors">{template.title}</h3>
      <p className="text-sm text-gray-400 mb-6 flex-1">{template.description}</p>
      
      {/* Mock Chat UI */}
      <div className="mt-auto space-y-4 pt-5 border-t border-white/10">
        {/* User Message */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-inner">U</div>
          <div className="bg-black/40 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-2 text-sm text-white/90 shadow-inner inline-block backdrop-blur-sm">
            {template.userMessage}
          </div>
        </div>
        
        {/* Bot Reply Arrow connecting to user message */}
        <div className="pl-3 border-l-2 border-white/10 ml-4 py-1"></div>

        {/* Bot Message */}
        <div className="ml-8 space-y-2 flex flex-col items-start">
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-100 rounded-2xl rounded-bl-sm px-4 py-2 text-sm shadow-inner inline-block max-w-[90%] backdrop-blur-sm">
            {template.botReplyText}
          </div>
          <div className="bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl px-4 py-2 text-sm text-center font-medium shadow-sm transition-all max-w-[90%] block backdrop-blur-sm">
            {template.botButtonText}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div>
        <h1 className="text-3xl font-bold mb-2">Automation templates</h1>
        <p className="text-text-secondary mb-6">Pre-filled automations to get you started. Pick one, customize the message and link, then go live.</p>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeFilter === cat 
                  ? 'bg-white text-black border-white' 
                  : 'bg-transparent text-text-secondary border-border hover:border-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-10">
        {(activeFilter === 'All' || activeFilter === 'Popular') && (
          <div>
            <h2 className="text-xl font-bold mb-1">Popular</h2>
            <p className="text-sm text-text-secondary mb-6">The templates most creators start with.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templatesData.filter(t => t.category === 'Popular').map(renderCard)}
            </div>
          </div>
        )}
        
        {(activeFilter === 'All' || activeFilter === 'Engage audience') && (
          <div>
            <h2 className="text-xl font-bold mb-1">Engage audience</h2>
            <p className="text-sm text-text-secondary mb-6">Say thanks and start conversations.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templatesData.filter(t => t.category === 'Engage audience').map(renderCard)}
            </div>
          </div>
        )}

        {(activeFilter === 'All' || activeFilter === 'Capture leads') && (
          <div>
            <h2 className="text-xl font-bold mb-1">Capture leads</h2>
            <p className="text-sm text-text-secondary mb-6">Collect emails and share free guides.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templatesData.filter(t => t.category === 'Capture leads').map(renderCard)}
            </div>
          </div>
        )}

        {(activeFilter === 'All' || activeFilter === 'Sell & earn') && (
          <div>
            <h2 className="text-xl font-bold mb-1">Sell & earn</h2>
            <p className="text-sm text-text-secondary mb-6">Send links to products you sell or promote.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templatesData.filter(t => t.category === 'Sell & earn').map(renderCard)}
            </div>
          </div>
        )}

        {(activeFilter === 'All' || activeFilter === 'Book clients') && (
          <div>
            <h2 className="text-xl font-bold mb-1">Book clients</h2>
            <p className="text-sm text-text-secondary mb-6">Send booking links and portfolios.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templatesData.filter(t => t.category === 'Book clients').map(renderCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
