export default function SignupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-[#283232]">{children}</div>;
}