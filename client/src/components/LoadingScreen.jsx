const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#3DA5D9] via-[#2C8AB8] to-[#2364AA] flex items-center justify-center z-50">
      <div className="text-center">
        <img 
          src="/logo.png" 
          alt="OLH 2.0" 
          className="w-32 h-32 mx-auto mb-6 animate-pulse drop-shadow-2xl"
        />
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">OLH 2.0</h1>
        <p className="text-xl text-white/90 mb-6 font-semibold">Online Learning Hub - Reloaded</p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-[#1BE7FF] rounded-full animate-bounce shadow-lg shadow-cyan-400/50" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-[#1BE7FF] rounded-full animate-bounce shadow-lg shadow-cyan-400/50" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-[#1BE7FF] rounded-full animate-bounce shadow-lg shadow-cyan-400/50" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;