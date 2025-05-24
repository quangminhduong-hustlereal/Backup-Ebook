import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
            <div className="flex-1">
                <Link to="/" className="btn btn-ghost text-xl">Book-Nest</Link>
            </div>
            <div className="flex-none">
                {/* Thêm items-center để căn chỉnh các mục menu theo chiều dọc */}
                <ul className="menu menu-horizontal px-1 items-center">
                    <li><Link to="/">Home</Link></li>
                    {isLoading && (
                        <li>
                            {/* Đảm bảo spinner cũng được căn giữa nếu cần */}
                            <span className="loading loading-spinner loading-sm"></span>
                        </li>
                    )}
                    {!isLoading && isAuthenticated && user && (
                        <li>
                            <div className="dropdown dropdown-end">
                                {/* Thay thế avatar bằng Welcome message */}
                                <div tabIndex={0} role="button" className="btn btn-ghost normal-case text-sm font-medium px-3">
                                    Welcome, {user.name}
                                </div>
                                {/* Menu dropdown vẫn giữ nguyên */}
                                <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-md dropdown-content bg-base-100 rounded-box w-52">
                                    <li>
                                        <Link to="/profile" className="justify-between">
                                            Profile
                                            <span className="badge">{user.role}</span>
                                        </Link>
                                    </li>
                                    <li><a>Settings</a></li>
                                    <li><button onClick={handleLogout}>Logout</button></li>
                                </ul>
                            </div>
                        </li>
                    )}
                    {!isLoading && !isAuthenticated && (
                        <>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register" className="btn btn-primary btn-sm ml-2">Register</Link></li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Navbar;
