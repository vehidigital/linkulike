'use client';
import { useRouter, useParams } from "next/navigation";
import { OnboardingSetup } from "@/components/biolink-dashboard/OnboardingSetup";

export default function OnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  async function handleComplete(data: any) {
    try {
      console.log('[ONBOARDING] Starting completion with data:', data);
      
      // Onboarding-Daten speichern (Avatar ist bereits hochgeladen)
      console.log('[ONBOARDING] Saving onboarding data');
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          bio: data.bio,
          avatarUrl: data.avatarUrl || undefined,
          links: data.links,
          userId: userId, // Add userId to help identify user
        }),
      });
      
      console.log('[ONBOARDING] Response status:', res.status);
      
      if (res.ok) {
        console.log('[ONBOARDING] Success, redirecting to dashboard');
        router.push(`/${userId}/dashboard-biolink/links`);
      } else {
        const errorData = await res.json();
        console.error('[ONBOARDING] Error response:', errorData);
        alert(`Fehler beim Speichern des Onboardings: ${errorData.error || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      console.error('[ONBOARDING] Exception during completion:', error);
      alert('Fehler beim Speichern des Onboardings.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <OnboardingSetup onComplete={handleComplete} />
    </div>
  );
} 