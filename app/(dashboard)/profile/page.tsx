import React from 'react'
import { ProfileHeader } from './_components/profile-header'
import { ProfileInfo } from './_components/profile-info'
import { AchievementCards } from './_components/achievement-cards'

export default function ProfilePage() {
  return (
    <div className='relative'>
      <div className="container mx-auto pt-6">
        <ProfileHeader />

        <div className="mt-8">
          {/* Columna principal - Información del perfil */}
          <div className="space-y-8">
            <ProfileInfo />
            <AchievementCards />
          </div>

          {/* Columna lateral - Insignias */}
          <div className="lg:col-span-1">
            {/* <ProfileBadges /> */}
          </div>
        </div>
      </div>
    </div>
  )
}
