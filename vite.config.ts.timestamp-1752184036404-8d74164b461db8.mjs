// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["lucide-react"]
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHByb3h5OiB7XG4gICAgICAvLyBQcm94eSBBUEkgcmVxdWVzdHMgdG8gYXZvaWQgQ09SUyBpc3N1ZXMgZHVyaW5nIGRldmVsb3BtZW50XG4gICAgICAnL2FwaS9wcm94eS9yZXN1bWUtb3B0aW1pemF0aW9uJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwczovL3Jlc3VtZWJ1aWxkZXItYXJmYi5vbnJlbmRlci5jb20nLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiAnL29wdGltaXplci9hcGkvb3B0aW1pemUtcmVzdW1lLycsXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBfb3B0aW9ucykgPT4ge1xuICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnIsIF9yZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwcm94eSBlcnJvcicsIGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVxJywgKHByb3h5UmVxLCByZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTZW5kaW5nIFJlcXVlc3QgdG8gdGhlIFRhcmdldDonLCByZXEubWV0aG9kLCByZXEudXJsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXMnLCAocHJveHlSZXMsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlY2VpdmVkIFJlc3BvbnNlIGZyb20gdGhlIFRhcmdldDonLCBwcm94eVJlcy5zdGF0dXNDb2RlLCByZXEudXJsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICAvLyBQcm94eSBBSSBlbmhhbmNlbWVudCByZXF1ZXN0c1xuICAgICAgJy9hcGkvYWktZW5oYW5jZSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9yZXN1bWVidWlsZGVyLWFyZmIub25yZW5kZXIuY29tJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aCxcbiAgICAgICAgY29uZmlndXJlOiAocHJveHksIF9vcHRpb25zKSA9PiB7XG4gICAgICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVyciwgX3JlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0FJIGVuaGFuY2VtZW50IHByb3h5IGVycm9yJywgZXJyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXEnLCAocHJveHlSZXEsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NlbmRpbmcgQUkgRW5oYW5jZW1lbnQgUmVxdWVzdDonLCByZXEubWV0aG9kLCByZXEudXJsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXMnLCAocHJveHlSZXMsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlY2VpdmVkIEFJIEVuaGFuY2VtZW50IFJlc3BvbnNlOicsIHByb3h5UmVzLnN0YXR1c0NvZGUsIHJlcS51cmwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIC8vIFByb3h5IHJlc3VtZSBleHRyYWN0aW9uIHJlcXVlc3RzXG4gICAgICAnL2FwaS9leHRyYWN0LXJlc3VtZS1qc29uJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwczovL3Jlc3VtZWJ1aWxkZXItYXJmYi5vbnJlbmRlci5jb20nLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLFxuICAgICAgICBjb25maWd1cmU6IChwcm94eSwgX29wdGlvbnMpID0+IHtcbiAgICAgICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyLCBfcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVzdW1lIGV4dHJhY3Rpb24gcHJveHkgZXJyb3InLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU2VuZGluZyBSZXN1bWUgRXh0cmFjdGlvbiBSZXF1ZXN0OicsIHJlcS5tZXRob2QsIHJlcS51cmwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcycsIChwcm94eVJlcywgcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVjZWl2ZWQgUmVzdW1lIEV4dHJhY3Rpb24gUmVzcG9uc2U6JywgcHJveHlSZXMuc3RhdHVzQ29kZSwgcmVxLnVybCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgLy8gUHJveHkgUERGIGdlbmVyYXRpb24gcmVxdWVzdHNcbiAgICAgICcvYXBpL29wdGltaXplLXJlc3VtZSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9yZXN1bWVidWlsZGVyLWFyZmIub25yZW5kZXIuY29tJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aCxcbiAgICAgICAgY29uZmlndXJlOiAocHJveHksIF9vcHRpb25zKSA9PiB7XG4gICAgICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVyciwgX3JlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1BERiBvcHRpbWl6YXRpb24gcHJveHkgZXJyb3InLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU2VuZGluZyBQREYgT3B0aW1pemF0aW9uIFJlcXVlc3Q6JywgcmVxLm1ldGhvZCwgcmVxLnVybCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVzJywgKHByb3h5UmVzLCByZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZWNlaXZlZCBQREYgT3B0aW1pemF0aW9uIFJlc3BvbnNlOicsIHByb3h5UmVzLnN0YXR1c0NvZGUsIHJlcS51cmwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIC8vIFByb3h5IGNvdmVyIGxldHRlciBnZW5lcmF0aW9uIHJlcXVlc3RzXG4gICAgICAnL2FwaS9nZW5lcmF0ZS1jb3Zlci1sZXR0ZXInOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8vcmVzdW1lYnVpbGRlci1hcmZiLm9ucmVuZGVyLmNvbScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgsXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBfb3B0aW9ucykgPT4ge1xuICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnIsIF9yZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb3ZlciBsZXR0ZXIgcHJveHkgZXJyb3InLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU2VuZGluZyBDb3ZlciBMZXR0ZXIgUmVxdWVzdDonLCByZXEubWV0aG9kLCByZXEudXJsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXMnLCAocHJveHlSZXMsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlY2VpdmVkIENvdmVyIExldHRlciBSZXNwb25zZTonLCBwcm94eVJlcy5zdGF0dXNDb2RlLCByZXEudXJsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICAvLyBQcm94eSByZXN1bWUgdGV4dCBleHRyYWN0aW9uIHJlcXVlc3RzXG4gICAgICAnL2FwaS9leHRyYWN0LXJlc3VtZS10ZXh0Jzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwczovL3Jlc3VtZWJ1aWxkZXItYXJmYi5vbnJlbmRlci5jb20nLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiAnL2V4dHJhY3QtcmVzdW1lLXRleHQnLFxuICAgICAgICBjb25maWd1cmU6IChwcm94eSwgX29wdGlvbnMpID0+IHtcbiAgICAgICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyLCBfcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVzdW1lIHRleHQgZXh0cmFjdGlvbiBwcm94eSBlcnJvcicsIGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgLy8gUHJveHkgQUkgZ2VuZXJhdGlvbiByZXF1ZXN0cyB0byBTdXBhYmFzZSBFZGdlIEZ1bmN0aW9ucyBpbiBkZXZlbG9wbWVudFxuICAgICAgJy9hcGkvYWkvZ2VuZXJhdGUtcmVzdW1lLWNvbnRlbnQnOiB7XG4gICAgICAgIHRhcmdldDogYCR7cHJvY2Vzcy5lbnYuVklURV9TVVBBQkFTRV9VUkwgfHwgJ2h0dHA6Ly9sb2NhbGhvc3Q6NTQzMjEnfS9mdW5jdGlvbnMvdjFgLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiAnL2dlbmVyYXRlLXJlc3VtZS1jb250ZW50JyxcbiAgICAgICAgY29uZmlndXJlOiAocHJveHksIF9vcHRpb25zKSA9PiB7XG4gICAgICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVyciwgX3JlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0FJIHJlc3VtZSBnZW5lcmF0aW9uIHByb3h5IGVycm9yJywgZXJyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICAnL2FwaS9haS9nZW5lcmF0ZS1jb3Zlci1sZXR0ZXInOiB7XG4gICAgICAgIHRhcmdldDogYCR7cHJvY2Vzcy5lbnYuVklURV9TVVBBQkFTRV9VUkwgfHwgJ2h0dHA6Ly9sb2NhbGhvc3Q6NTQzMjEnfS9mdW5jdGlvbnMvdjFgLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiAnL2dlbmVyYXRlLWNvdmVyLWxldHRlcicsXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBfb3B0aW9ucykgPT4ge1xuICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnIsIF9yZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBSSBjb3ZlciBsZXR0ZXIgZ2VuZXJhdGlvbiBwcm94eSBlcnJvcicsIGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgfVxuICB9XG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUdsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxFQUMxQjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBO0FBQUEsTUFFTCxrQ0FBa0M7QUFBQSxRQUNoQyxRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUMsU0FBUztBQUFBLFFBQ25CLFdBQVcsQ0FBQyxPQUFPLGFBQWE7QUFDOUIsZ0JBQU0sR0FBRyxTQUFTLENBQUMsS0FBSyxNQUFNLFNBQVM7QUFDckMsb0JBQVEsSUFBSSxlQUFlLEdBQUc7QUFBQSxVQUNoQyxDQUFDO0FBQ0QsZ0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxLQUFLLFNBQVM7QUFDNUMsb0JBQVEsSUFBSSxrQ0FBa0MsSUFBSSxRQUFRLElBQUksR0FBRztBQUFBLFVBQ25FLENBQUM7QUFDRCxnQkFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLEtBQUssU0FBUztBQUM1QyxvQkFBUSxJQUFJLHNDQUFzQyxTQUFTLFlBQVksSUFBSSxHQUFHO0FBQUEsVUFDaEYsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUE7QUFBQSxNQUVBLG1CQUFtQjtBQUFBLFFBQ2pCLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTO0FBQUEsUUFDbkIsV0FBVyxDQUFDLE9BQU8sYUFBYTtBQUM5QixnQkFBTSxHQUFHLFNBQVMsQ0FBQyxLQUFL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
