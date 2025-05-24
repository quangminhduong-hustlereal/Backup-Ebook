import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';
import { useRef, useEffect } from 'react';

const ProfilePage = () => {
    const { user } = useAuth();
    const profileCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        profileCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-gray-600">User information not found or you are not logged in.</p>
            </div>
        );
    }

    const profileItems = [
        {
            label: "Full Name",
            value: user.name,
            icon: <FiUser className="mr-3 text-indigo-500" size={20} />
        },
        {
            label: "Email",
            value: user.email,
            icon: <FiMail className="mr-3 text-indigo-500" size={20} />
        },
        {
            label: "Phone Number",
            value: user.phoneNumber,
            icon: <FiPhone className="mr-3 text-indigo-500" size={20} />
        },
        {
            label: "Role",
            value: user.role,
            icon: <FiBriefcase className="mr-3 text-indigo-500" size={20} />,
            isBadge: true,
            badgeClass: user.role === 'Seller' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
        },
        {
            label: "Status",
            value: user.status ? 'Active' : 'Locked',
            icon: user.status ? <FiCheckCircle className="mr-3 text-green-500" size={20} /> : <FiXCircle className="mr-3 text-red-500" size={20} />,
            isBadge: true,
            badgeClass: user.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        },
        {
            label: "Joined Date",
            value: new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            icon: <FiCalendar className="mr-3 text-indigo-500" size={20} />
        }
    ];

    return (
        <div className="py-4 px-4 sm:px-6 lg:px-8">
            <div ref={profileCardRef} className="max-w-xl w-full mx-auto">
                <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
                    <div className="bg-indigo-600 p-4 sm:p-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white text-center tracking-tight">
                            My Profile
                        </h1>
                    </div>
                    <div className="p-4 sm:p-6 space-y-4">
                        {profileItems.map((item, index) => (
                            <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                                <div className="flex items-center text-gray-500 font-medium mb-1 sm:mb-2">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                                {item.isBadge ? (
                                    <span className={`px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-semibold rounded-full ${item.badgeClass}`}>
                                        {item.value}
                                    </span>
                                ) : (
                                    <p className="text-gray-800 text-base sm:text-lg ml-8">{item.value}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-center text-xs text-gray-500 mt-6">
                    Book-Nest User Profile &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};

export default ProfilePage;
