import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children, title = 'Dashboard' }) => {
    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
            <Sidebar />

            <div className="flex flex-1 flex-col ml-64 transition-all duration-300">
                <Header title={title} />

                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
