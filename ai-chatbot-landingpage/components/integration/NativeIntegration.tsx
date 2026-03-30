import { integrations } from "@/lib/Constants";
import { Button } from "../common/Button";
import {
  Code,
  Terminal,
  Zap,
  Globe,
  Layers,
  Shield,
  Copy,
  CheckCircle,
  Rocket,
  Settings,
  Users,
  MessageSquare,
  FileText,
  Layout,
  Smartphone,
  Database,
  Cloud
} from "lucide-react";

export function NativeIntegration() {
  // Map integration icons based on title
  const getIntegrationIcon = (title: string) => {
    const iconMap: { [key: string]: any } = {
      "Create your ScopeAIChat": Rocket,
      "Customize appearance": Settings,
      "Embed in your website": Code,
      // Add more mappings based on your actual integration titles
    };
    const IconComponent = iconMap[title] || MessageSquare;
    return <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
  };

  return (
    <div className="">
      {/* 3 Simple Steps Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.05),transparent_25%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.1),transparent_25%)]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 mb-4 transition-colors">
              <Rocket className="w-4 h-4 mr-2" />
              Quick Setup
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              Launch in 3 simple steps
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed transition-colors">
              From setup to live deployment, our widget integration flow is designed to get your AI assistant online in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((item, i) => (
              <div
                key={i}
                className="group bg-white dark:bg-gray-900/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 backdrop-blur-sm"
              >
                {/* Step number badge with icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                    {i + 1}
                  </div>
                  {/* <div className="text-blue-600 dark:text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity">
                    {getIntegrationIcon(item.title)}
                  </div> */}
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-3 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm transition-colors">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Friendly Section */}
      <section id="developers" className="relative overflow-hidden py-16 sm:py-20 bg-white dark:bg-gray-900 transition-colors">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.05),transparent_25%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.08),transparent_25%)]"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 sm:p-8 lg:p-10 shadow-xl transition-all duration-300 backdrop-blur-sm">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left Content */}
              <div>
                <span className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 transition-colors">
                  <Code className="w-4 h-4 mr-2" />
                  Developer Friendly
                </span>
                <h2 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Works with your stack
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400 transition-colors">
                  Whether you're embedding on a static site or integrating inside a modern web app, our widget is built for speed, flexibility, and production-ready deployment.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Terminal, text: "HTML Script Install", color: "from-orange-500 to-red-500", description: "Simple script tag integration" },
                    { icon: Zap, text: "React Ready", color: "from-blue-500 to-cyan-500", description: "Hook-based React components" },
                    { icon: Globe, text: "Next.js Compatible", color: "from-purple-500 to-pink-500", description: "SSR & static generation" },
                    { icon: Layers, text: "API & Webhooks", color: "from-green-500 to-emerald-500", description: "RESTful API endpoints" }
                  ].map((tech, idx) => (
                    <div
                      key={idx}
                      className="group flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tech.color} p-2 text-white shadow-md group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                        <tech.icon className="w-full h-full" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {tech.text}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {tech.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button
                    radius="rounded-xl"
                    text="View Developer Docs"
                    height="h-11"
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  />
                  <button className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                    <FileText className="w-4 h-4" />
                    API Reference
                  </button>
                </div>
              </div>

              {/* Mock code preview */}
              <div className="relative group">
                {/* Decorative glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-950 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4 bg-black">
                    <div className="flex gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-500 shadow-lg"></span>
                      <span className="h-3 w-3 rounded-full bg-yellow-500 shadow-lg"></span>
                      <span className="h-3 w-3 rounded-full bg-green-500 shadow-lg"></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Code className="w-3 h-3 text-blue-400" />
                      <span className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-300">Installation</span>
                    </div>
                  </div>
                  <div className="px-6 py-6 text-sm text-gray-100 overflow-x-auto bg-black">
                    <pre className="whitespace-pre-wrap leading-7 text-white font-mono"><code>{`<script>
                          window.AIChatbotConfig = {
                            tenant: 'your-tenant',
                            apiUrl: 'https://api.yourdomain.com/api/v1'
                          };
                        </script>
                        <script src="https://cdn.yourdomain.com/widget.js" async></script>`}</code></pre>
                  </div>

                  {/* Copy button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tech stack badges */}
                <div className="absolute -bottom-3 -right-3 flex gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 shadow-md">
                    <Database className="w-3 h-3" />
                    npm install
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 shadow-md">
                    <Cloud className="w-3 h-3" />
                    CDN available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}