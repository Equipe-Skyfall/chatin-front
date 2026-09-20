import ProtectedRoute from "@/components/ProtectedRoute";
import { ProfilePage } from "@/components/profile_components/ProfilePage";

export default function PerfilRoute() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
    
  );
}