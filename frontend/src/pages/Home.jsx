import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Stethoscope, Pill, History, ArrowRight, Shield, Clock, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-surface to-surface-container-low py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-label-md mb-6">
                <Shield size={16} />
                <span>Trusted Healthcare Platform</span>
              </div>
              
              <h1 className="text-display-lg text-on-surface mb-6 leading-tight">
                Hospital Management <br />
                <span className="text-primary">System</span>
              </h1>
              
              <p className="text-body-lg text-on-surface-variant mb-8 max-w-lg">
                Book appointments with our doctors, manage prescriptions, 
                and track your visit history — all in one place.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/doctors" className="px-6 py-3 bg-primary text-on-primary rounded-xl font-label-md hover:bg-primary-container transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                  Find a Doctor
                  <ArrowRight size={20} />
                </Link>
                <Link to="/register" className="px-6 py-3 border-2 border-primary text-primary rounded-xl font-label-md hover:bg-primary/5 transition-all flex items-center gap-2">
                  Register
                  <ArrowRight size={20} />
                </Link>
              </div>

              <div className="flex items-center gap-8 mt-8 pt-8 border-t border-outline-variant/30">
                <div>
                  <p className="text-title-lg font-bold text-primary">50+</p>
                  <p className="text-label-md text-on-surface-variant">Expert Doctors</p>
                </div>
                <div>
                  <p className="text-title-lg font-bold text-primary">10k+</p>
                  <p className="text-label-md text-on-surface-variant">Happy Patients</p>
                </div>
                <div>
                  <p className="text-title-lg font-bold text-primary">98%</p>
                  <p className="text-label-md text-on-surface-variant">Satisfaction Rate</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-lg border border-outline-variant/30">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3">
                    <Calendar size={24} />
                  </div>
                  <h3 className="font-semibold text-on-surface mb-1">Easy Booking</h3>
                  <p className="text-label-md text-on-surface-variant">Schedule appointments in seconds</p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-lg border border-outline-variant/30">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3">
                    <Pill size={24} />
                  </div>
                  <h3 className="font-semibold text-on-surface mb-1">Prescriptions</h3>
                  <p className="text-label-md text-on-surface-variant">Digital prescriptions anytime</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-lg border border-outline-variant/30">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3">
                    <Stethoscope size={24} />
                  </div>
                  <h3 className="font-semibold text-on-surface mb-1">Expert Doctors</h3>
                  <p className="text-label-md text-on-surface-variant">Top specialists available</p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-lg border border-outline-variant/30">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3">
                    <History size={24} />
                  </div>
                  <h3 className="font-semibold text-on-surface mb-1">Visit History</h3>
                  <p className="text-label-md text-on-surface-variant">Track your health journey</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-headline-lg text-on-surface mb-3">Why Choose MediPrecise?</h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Comprehensive healthcare management at your fingertips
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                <Clock size={28} />
              </div>
              <h3 className="text-title-lg text-on-surface mb-2">24/7 Access</h3>
              <p className="text-body-md text-on-surface-variant">
                Access your health records and book appointments anytime, anywhere
              </p>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                <Shield size={28} />
              </div>
              <h3 className="text-title-lg text-on-surface mb-2">Secure & Private</h3>
              <p className="text-body-md text-on-surface-variant">
                Your health data is encrypted and protected with enterprise-grade security
              </p>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                <Users size={28} />
              </div>
              <h3 className="text-title-lg text-on-surface mb-2">Expert Network</h3>
              <p className="text-body-md text-on-surface-variant">
                Connect with certified doctors and specialists across multiple disciplines
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-headline-lg text-on-primary mb-4">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-body-lg text-on-primary/80 mb-8 max-w-2xl mx-auto">
            Join thousands of patients who trust MediPrecise for their healthcare needs
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="px-8 py-3 bg-white text-primary rounded-xl font-label-md hover:bg-surface-container transition-all shadow-lg hover:shadow-xl">
              Get Started Now
            </Link>
            <Link to="/doctors" className="px-8 py-3 border-2 border-white text-on-primary rounded-xl font-label-md hover:bg-white/10 transition-all">
              Find a Doctor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;