import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const ContactForm: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const { error } = await supabase
                .from('messages')
                .insert([{
                    name: formData.name,
                    email: formData.email,
                    message: formData.message
                }]);

            if (error) throw error;

            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error('Error sending message:', error);
            setStatus('error');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="bg-garage-900 border border-garage-800 p-8 rounded-sm shadow-2xl">
            <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">Get in <span className="text-bronze-500">Touch</span></h3>
            <p className="text-garage-400 text-sm mb-6">Have a question or need a quote? Send us a message.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs text-garage-500 uppercase mb-1 font-bold tracking-wider">Name</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none transition-colors"
                        placeholder="Your Name"
                    />
                </div>
                <div>
                    <label className="block text-xs text-garage-500 uppercase mb-1 font-bold tracking-wider">Email</label>
                    <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none transition-colors"
                        placeholder="your@email.com"
                    />
                </div>
                <div>
                    <label className="block text-xs text-garage-500 uppercase mb-1 font-bold tracking-wider">Message</label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none transition-colors"
                        placeholder="How can we help?"
                    />
                </div>

                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full bg-bronze-600 hover:bg-bronze-500 text-white py-3 font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(205,127,50,0.2)] disabled:opacity-50"
                >
                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                </button>

                {status === 'success' && (
                    <div className="text-green-500 text-sm text-center font-bold animate-pulse">
                        Message sent successfully! We'll be in touch.
                    </div>
                )}
                {status === 'error' && (
                    <div className="text-red-500 text-sm text-center font-bold">
                        Failed to send message. Please try again.
                    </div>
                )}
            </form>
        </div>
    );
};

export default ContactForm;
