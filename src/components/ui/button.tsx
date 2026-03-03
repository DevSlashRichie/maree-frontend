export function Button({ children }: { children: React.ReactNode }) {
    return (
        <button type="button" className="bg-primary">
            {children}
        </button>
    );
}
