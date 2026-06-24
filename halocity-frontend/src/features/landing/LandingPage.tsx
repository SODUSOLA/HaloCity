import LandingNav from './components/LandingNav'
import HeroSection from './components/HeroSection'
import ProblemSection from './components/ProblemSection'
import SolutionSection from './components/SolutionSection'
import HowItWorksSection from './components/HowItWorksSection'
import FeaturesSection from './components/FeaturesSection'
import StatsSection from './components/StatsSection'
import RolesSection from './components/RolesSection'
import NetworkSection from './components/NetworkSection'
import LandingFooter from './components/LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <FeaturesSection />
      <StatsSection />
      <RolesSection />
      <NetworkSection />
      <LandingFooter />
    </div>
  )
}
