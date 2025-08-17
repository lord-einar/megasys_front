// src/components/layout/Layout.jsx
import React from 'react'
import { useApp } from '../../context/AppContext'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

const Layout = ({ children }) => {
  const app = useApp()
  const getSidebarConfig =
    app && typeof app.getSidebarConfig === 'function'
      ? app.getSidebarConfig
      : () => ({ shouldShow: false, isOverlay: false, collapsible: true })

  const sidebarConfig = getSidebarConfig()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      {sidebarConfig.isOverlay && sidebarConfig.shouldShow && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="py-6">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default Layout
