import { Hero } from '@/components/sections/hero'
import { Features } from '@/components/sections/features'
import { TechStack } from '@/components/sections/tech-stack'
import { CTA } from '@/components/sections/cta'
import { ProjectList } from '@/components/dashboard/project-list'
import { HealthStatusWidget } from '@/components/dashboard/health-status'

export default function HomePage() {
  return (
    <div className="space-y-16">
      <Hero />
      
      {/* Dashboard Preview Section */}
      <section className="py-12 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Platforma în Acțiune
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Vezi cum arată dashboard-ul și statusul sistemului în timp real
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* System Health Status */}
            <div className="lg:col-span-1">
              <HealthStatusWidget />
            </div>
            
            {/* Projects Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📁 Proiecte Demo
                </h3>
                <ProjectList />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Features />
      <TechStack />
      <CTA />
    </div>
  )
}