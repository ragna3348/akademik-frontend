export default function EmptyState({ message = 'Belum ada data' }) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-400">{message}</p>
        </div>
    );
}