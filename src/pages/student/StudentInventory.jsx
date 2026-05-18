export default function StudentInventory({ user }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="text-5xl mb-4">🔒</div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">Akses Ditolak</h3>
      <p className="text-sm text-gray-500 max-w-xs">Halaman manajemen inventaris hanya dapat diakses oleh Admin dan Penjaga SG.</p>
    </div>
  );
}
