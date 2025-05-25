import React from 'react';

interface FooterProps {
    type?: 'login' | 'register';
}

const Footer: React.FC<FooterProps> = ({ type = 'login' }) => {
    return (
        <footer className="w-full py-4 bg-white">
            <p className="text-center text-xs text-gray-500">
                Book-Nest {type === 'login' ? 'Login' : 'Register'} &copy; {new Date().getFullYear()}
            </p>
        </footer>
    );
};

export default Footer;
