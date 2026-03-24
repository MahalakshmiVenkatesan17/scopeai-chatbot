

import { HeroIntegration , NativeIntegration, WebsiteBuilders} from '@/components/integration'
import { Breadcrumb } from '@/components/common'
export default function IntegrationPage() {
  return (
    <div>
      <Breadcrumb />
      <HeroIntegration />
      <NativeIntegration /> 
      <WebsiteBuilders />
    </div>
  )
}


