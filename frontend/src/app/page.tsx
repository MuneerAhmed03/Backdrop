import { AuthButton } from "./components/AuthButton";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full items-center justify-between text-sm">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-4xl font-bold mb-8">Welcome to the App</h1>
          <AuthButton />
        </div>
      </div>
    </main>
  );
}
