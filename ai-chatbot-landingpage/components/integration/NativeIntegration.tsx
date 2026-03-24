import { integrations } from "@/lib/Constants";
import { Button } from "../common/Button";

export function NativeIntegration() {
  return (
    <div>
        <section className="integration-native-bg py-10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Launch in 3 simple steps
          </h2>

          <p className="text-gray-500 mb-10 text-lg leading-relaxed sm:leading-8">
            From setup to live deployment, our widget integration flow is designed to get your AI assistant online in minutes.
          </p>

          <div className="grid lg:grid-cols-3 flex-col gap-4">
            {integrations.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col items-start gap-3 border border-gray-100"
              >
                {/* Step number badge */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
                  {i + 1}
                </div>

                {/* Icon + Content */}
                <div className="flex items-start gap-5 flex-1">
                  {/* <img
                    src={item.icon}
                    alt={item.title}
                    className="w-8 h-8 mt-0.5 object-contain flex-shrink-0"
                  /> */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-xl mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed text-sm">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </section>
         <section id="developers" className="integration-native-bg py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-card lg:p-10">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                <div>
                  <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
                    Developer Friendly
                  </span>
                  <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    Works with your stack
                  </h2>
                  <p className="mt-4 text-lg leading-8 text-slate-600">
                    Whether you’re embedding on a static site or integrating inside a modern web app, our widget is built for speed, flexibility, and production-ready deployment.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">HTML Script Install</div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">React Ready</div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">Next.js Compatible</div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">API & Webhooks</div>
                  </div>

                  {/* <div className="mt-8">
                    <Button radius="rounded-xl" text="View Developer Docs" height="h-10" />
                      
                  </div> */}
                </div>

                {/* Mock code preview */}
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-soft">
                  <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                    <div className="flex gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-400"></span>
                      <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                      <span className="h-3 w-3 rounded-full bg-green-400"></span>
                    </div>
                    <span className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200">Fast Setup</span>
                  </div>
                  <div className="px-6 py-5 text-sm text-slate-100 overflow-x-auto">
<pre className="whitespace-pre-wrap leading-7 text-white font-mono"><code>{`<script>
  window.AIChatbotConfig = {
    tenant: 'your-tenant',
    apiUrl: 'https://api.yourdomain.com/api/v1'
  };
</script>
<script src="https://cdn.yourdomain.com/widget.js" async></script>`}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
    </div>
 
    
  );
}
