import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/dashboard');
        } else {
            router.push('/login');
        }
    }, []);

    return (
        <div className="min-h-screen bg-blue-900 flex items-center justify-center">
            <div className="text-white text-xl">Loading...</div>
        </div>
    );
}