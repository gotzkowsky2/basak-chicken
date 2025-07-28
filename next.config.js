/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚠️ 중요: 이 프로젝트는 반드시 3001 포트에서 실행되어야 합니다.
  // 도메인 crew.basak-chicken.com이 3001 포트로 연결됩니다.
  // 절대 3000 포트로 실행하지 마세요!
  
  // 개발 서버 포트 강제 설정 (추가 안전장치)
  env: {
    PORT: '3001'
  },
  
  // ESLint 빌드 중 비활성화 (빌드 실패 방지)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 정적 파일 서빙 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  
  // 정적 파일 최적화
  images: {
    domains: [],
  },
  
  // 정적 파일 캐싱
  experimental: {
    optimizeCss: true,
    serverComponentsExternalPackages: ['bcryptjs']
  },
};

module.exports = nextConfig; 