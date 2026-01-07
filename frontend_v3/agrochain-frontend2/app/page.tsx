'use client'

import { FarmHealthCard } from '@/app/components/Dashboard/FarmHealthCard'
import { QuickActions } from '@/app/components/Dashboard/QuickActions'
import { AlertsSection } from '@/app/components/Dashboard/AlertsSection'
import { ActivityTimeline } from '@/app/components/Dashboard/ActivityTimeline'
import { motion } from 'framer-motion'
import { StaggeredList, StaggeredItem } from '@/app/components/Layout/PageTransition'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
}

export default function HomePage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="text-center md:text-left">
        <h1 className="text-responsive-h1 text-gray-900 mb-2">
          Welcome back, Rajesh! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your farm today
        </p>
      </motion.div>

      {/* Farm Health Summary */}
      <motion.div variants={itemVariants}>
        <FarmHealthCard
          score={82}
          lastCrop="Wheat"
          moisture="Optimal"
          nextAction="Prep for Kharif"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>
          <p className="text-sm text-gray-600">
            Everything you need, one tap away
          </p>
        </div>
        <QuickActions />
      </motion.div>

      {/* Alerts & Advisories */}
      <motion.div variants={itemVariants}>
        <AlertsSection />
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <ActivityTimeline />
      </motion.div>

      {/* Weather Forecast - Responsive Grid */}
      <motion.div variants={itemVariants}>
        <div className="card-responsive">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Weather Forecast
          </h2>
          <div className="grid grid-cols-3 xs:grid-cols-5 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
              <motion.div
                key={day}
                whileHover={{ scale: 1.05 }}
                className="text-center p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="text-sm text-gray-600 mb-1">{day}</div>
                <div className="text-2xl mb-1">🌤️</div>
                <div className="font-medium">32°</div>
                <div className="text-xs text-gray-500">20% rain</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div variants={itemVariants}>
        <div className="grid-responsive">
          {[
            { label: 'Predictions Made', value: '47', change: '+12%' },
            { label: 'Crops Registered', value: '12', change: '+3' },
            { label: 'Yield Accuracy', value: '88%', change: '+5%' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-responsive text-center"
            >
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              <div className="text-xs text-agro-green mt-2">{stat.change} this month</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}