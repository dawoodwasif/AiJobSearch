// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  define: {
    // Make sure process.env is available in browser for compatibility
    "process.env": {}
  },
  envPrefix: ["VITE_"],
  // Ensure VITE_ prefixed vars are exposed
  optimizeDeps: {
    include: ["lucide-react", "react-pdf", "pdfjs-dist"]
  },
  build: {
    commonjsOptions: {
      include: [/react-pdf/, /pdfjs-dist/]
    }
  },
  server: {
    proxy: {
      // Proxy API requests to avoid CORS issues during development
      "/api/proxy/resume-optimization": {
        target: "https://resumebuilder-arfb.onrender.com",
        changeOrigin: true,
        rewrite: (path) => "/optimizer/api/optimize-resume/",
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
          });
        }
      },
      // Proxy AI enhancement requests
      "/api/ai-enhance": {
        target: "https://resumebuilder-arfb.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("AI enhancement proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending AI Enhancement Request:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received AI Enhancement Response:", proxyRes.statusCode, req.url);
          });
        }
      },
      // Proxy resume extraction requests
      "/api/extract-resume-json": {
        target: "https://resumebuilder-arfb.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("Resume extraction proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Resume Extraction Request:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received Resume Extraction Response:", proxyRes.statusCode, req.url);
          });
        }
      },
      // Proxy PDF generation requests
      "/api/optimize-resume": {
        target: "https://resumebuilder-arfb.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("PDF optimization proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending PDF Optimization Request:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received PDF Optimization Response:", proxyRes.statusCode, req.url);
          });
        }
      },
      // Proxy cover letter generation requests
      "/api/generate-cover-letter": {
        target: "https://resumebuilder-arfb.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("Cover letter proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Cover Letter Request:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received Cover Letter Response:", proxyRes.statusCode, req.url);
          });
        }
      },
      // Proxy resume text extraction requests
      "/api/extract-resume-text": {
        target: "https://resumebuilder-arfb.onrender.com",
        changeOrigin: true,
        rewrite: (path) => "/extract-resume-text",
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("Resume text extraction proxy error", err);
          });
        }
      },
      // Proxy AI generation requests to Supabase Edge Functions in development
      "/api/ai/generate-resume-content": {
        target: `${process.env.VITE_SUPABASE_URL || "http://localhost:54321"}/functions/v1`,
        changeOrigin: true,
        rewrite: (path) => "/generate-resume-content",
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("AI resume generation proxy error", err);
          });
        }
      },
      "/api/ai/generate-cover-letter": {
        target: `${process.env.VITE_SUPABASE_URL || "http://localhost:54321"}/functions/v1`,
        changeOrigin: true,
        rewrite: (path) => "/generate-cover-letter",
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("AI cover letter generation proxy error", err);
          });
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIGRlZmluZToge1xuICAgIC8vIE1ha2Ugc3VyZSBwcm9jZXNzLmVudiBpcyBhdmFpbGFibGUgaW4gYnJvd3NlciBmb3IgY29tcGF0aWJpbGl0eVxuICAgICdwcm9jZXNzLmVudic6IHt9LFxuICB9LFxuICBlbnZQcmVmaXg6IFsnVklURV8nXSwgLy8gRW5zdXJlIFZJVEVfIHByZWZpeGVkIHZhcnMgYXJlIGV4cG9zZWRcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogWydsdWNpZGUtcmVhY3QnLCAncmVhY3QtcGRmJywgJ3BkZmpzLWRpc3QnXSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBjb21tb25qc09wdGlvbnM6IHtcbiAgICAgIGluY2x1ZGU6IFsvcmVhY3QtcGRmLywgL3BkZmpzLWRpc3QvXSxcbiAgICB9LFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwcm94eToge1xuICAgICAgLy8gUHJveHkgQVBJIHJlcXVlc3RzIHRvIGF2b2lkIENPUlMgaXNzdWVzIGR1cmluZyBkZXZlbG9wbWVudFxuICAgICAgJy9hcGkvcHJveHkvcmVzdW1lLW9wdGltaXphdGlvbic6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9yZXN1bWVidWlsZGVyLWFyZmIub25yZW5kZXIuY29tJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gJy9vcHRpbWl6ZXIvYXBpL29wdGltaXplLXJlc3VtZS8nLFxuICAgICAgICBjb25maWd1cmU6IChwcm94eSwgX29wdGlvbnMpID0+IHtcbiAgICAgICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyLCBfcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygncHJveHkgZXJyb3InLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU2VuZGluZyBSZXF1ZXN0IHRvIHRoZSBUYXJnZXQ6JywgcmVxLm1ldGhvZCwgcmVxLnVybCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVzJywgKHByb3h5UmVzLCByZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZWNlaXZlZCBSZXNwb25zZSBmcm9tIHRoZSBUYXJnZXQ6JywgcHJveHlSZXMuc3RhdHVzQ29kZSwgcmVxLnVybCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgLy8gUHJveHkgQUkgZW5oYW5jZW1lbnQgcmVxdWVzdHNcbiAgICAgICcvYXBpL2FpLWVuaGFuY2UnOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8vcmVzdW1lYnVpbGRlci1hcmZiLm9ucmVuZGVyLmNvbScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgsXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBfb3B0aW9ucykgPT4ge1xuICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnIsIF9yZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBSSBlbmhhbmNlbWVudCBwcm94eSBlcnJvcicsIGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVxJywgKHByb3h5UmVxLCByZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTZW5kaW5nIEFJIEVuaGFuY2VtZW50IFJlcXVlc3Q6JywgcmVxLm1ldGhvZCwgcmVxLnVybCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVzJywgKHByb3h5UmVzLCByZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZWNlaXZlZCBBSSBFbmhhbmNlbWVudCBSZXNwb25zZTonLCBwcm94eVJlcy5zdGF0dXNDb2RlLCByZXEudXJsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICAvLyBQcm94eSByZXN1bWUgZXh0cmFjdGlvbiByZXF1ZXN0c1xuICAgICAgJy9hcGkvZXh0cmFjdC1yZXN1bWUtanNvbic6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9yZXN1bWVidWlsZGVyLWFyZmIub25yZW5kZXIuY29tJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aCxcbiAgICAgICAgY29uZmlndXJlOiAocHJveHksIF9vcHRpb25zKSA9PiB7XG4gICAgICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVyciwgX3JlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1Jlc3VtZSBleHRyYWN0aW9uIHByb3h5IGVycm9yJywgZXJyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXEnLCAocHJveHlSZXEsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NlbmRpbmcgUmVzdW1lIEV4dHJhY3Rpb24gUmVxdWVzdDonLCByZXEubWV0aG9kLCByZXEudXJsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXMnLCAocHJveHlSZXMsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlY2VpdmVkIFJlc3VtZSBFeHRyYWN0aW9uIFJlc3BvbnNlOicsIHByb3h5UmVzLnN0YXR1c0NvZGUsIHJlcS51cmwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIC8vIFByb3h5IFBERiBnZW5lcmF0aW9uIHJlcXVlc3RzXG4gICAgICAnL2FwaS9vcHRpbWl6ZS1yZXN1bWUnOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8vcmVzdW1lYnVpbGRlci1hcmZiLm9ucmVuZGVyLmNvbScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgsXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBfb3B0aW9ucykgPT4ge1xuICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnIsIF9yZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQREYgb3B0aW1pemF0aW9uIHByb3h5IGVycm9yJywgZXJyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXEnLCAocHJveHlSZXEsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NlbmRpbmcgUERGIE9wdGltaXphdGlvbiBSZXF1ZXN0OicsIHJlcS5tZXRob2QsIHJlcS51cmwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcycsIChwcm94eVJlcywgcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVjZWl2ZWQgUERGIE9wdGltaXphdGlvbiBSZXNwb25zZTonLCBwcm94eVJlcy5zdGF0dXNDb2RlLCByZXEudXJsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICAvLyBQcm94eSBjb3ZlciBsZXR0ZXIgZ2VuZXJhdGlvbiByZXF1ZXN0c1xuICAgICAgJy9hcGkvZ2VuZXJhdGUtY292ZXItbGV0dGVyJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwczovL3Jlc3VtZWJ1aWxkZXItYXJmYi5vbnJlbmRlci5jb20nLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLFxuICAgICAgICBjb25maWd1cmU6IChwcm94eSwgX29wdGlvbnMpID0+IHtcbiAgICAgICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyLCBfcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQ292ZXIgbGV0dGVyIHByb3h5IGVycm9yJywgZXJyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXEnLCAocHJveHlSZXEsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NlbmRpbmcgQ292ZXIgTGV0dGVyIFJlcXVlc3Q6JywgcmVxLm1ldGhvZCwgcmVxLnVybCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVzJywgKHByb3h5UmVzLCByZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZWNlaXZlZCBDb3ZlciBMZXR0ZXIgUmVzcG9uc2U6JywgcHJveHlSZXMuc3RhdHVzQ29kZSwgcmVxLnVybCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgLy8gUHJveHkgcmVzdW1lIHRleHQgZXh0cmFjdGlvbiByZXF1ZXN0c1xuICAgICAgJy9hcGkvZXh0cmFjdC1yZXN1bWUtdGV4dCc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9yZXN1bWVidWlsZGVyLWFyZmIub25yZW5kZXIuY29tJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gJy9leHRyYWN0LXJlc3VtZS10ZXh0JyxcbiAgICAgICAgY29uZmlndXJlOiAocHJveHksIF9vcHRpb25zKSA9PiB7XG4gICAgICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVyciwgX3JlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1Jlc3VtZSB0ZXh0IGV4dHJhY3Rpb24gcHJveHkgZXJyb3InLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIC8vIFByb3h5IEFJIGdlbmVyYXRpb24gcmVxdWVzdHMgdG8gU3VwYWJhc2UgRWRnZSBGdW5jdGlvbnMgaW4gZGV2ZWxvcG1lbnRcbiAgICAgICcvYXBpL2FpL2dlbmVyYXRlLXJlc3VtZS1jb250ZW50Jzoge1xuICAgICAgICB0YXJnZXQ6IGAke3Byb2Nlc3MuZW52LlZJVEVfU1VQQUJBU0VfVVJMIHx8ICdodHRwOi8vbG9jYWxob3N0OjU0MzIxJ30vZnVuY3Rpb25zL3YxYCxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gJy9nZW5lcmF0ZS1yZXN1bWUtY29udGVudCcsXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBfb3B0aW9ucykgPT4ge1xuICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnIsIF9yZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBSSByZXN1bWUgZ2VuZXJhdGlvbiBwcm94eSBlcnJvcicsIGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgJy9hcGkvYWkvZ2VuZXJhdGUtY292ZXItbGV0dGVyJzoge1xuICAgICAgICB0YXJnZXQ6IGAke3Byb2Nlc3MuZW52LlZJVEVfU1VQQUJBU0VfVVJMIHx8ICdodHRwOi8vbG9jYWxob3N0OjU0MzIxJ30vZnVuY3Rpb25zL3YxYCxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gJy9nZW5lcmF0ZS1jb3Zlci1sZXR0ZXInLFxuICAgICAgICBjb25maWd1cmU6IChwcm94eSwgX29wdGlvbnMpID0+IHtcbiAgICAgICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyLCBfcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQUkgY292ZXIgbGV0dGVyIGdlbmVyYXRpb24gcHJveHkgZXJyb3InLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFHbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFFBQVE7QUFBQTtBQUFBLElBRU4sZUFBZSxDQUFDO0FBQUEsRUFDbEI7QUFBQSxFQUNBLFdBQVcsQ0FBQyxPQUFPO0FBQUE7QUFBQSxFQUNuQixjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsZ0JBQWdCLGFBQWEsWUFBWTtBQUFBLEVBQ3JEO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxpQkFBaUI7QUFBQSxNQUNmLFNBQVMsQ0FBQyxhQUFhLFlBQVk7QUFBQSxJQUNyQztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQTtBQUFBLE1BRUwsa0NBQWtDO0FBQUEsUUFDaEMsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFD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
