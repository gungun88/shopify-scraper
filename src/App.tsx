import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  PackageSearch, 
  Settings, 
  Plus, 
  Search, 
  Bell, 
  ArrowUpRight, 
  Database, 
  Activity, 
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Globe,
  Download,
  Filter,
  Image as ImageIcon,
  Tag,
  ExternalLink,
  User,
  Link,
  FolderTree,
  Info
} from 'lucide-react';

// --- Types ---
type Platform = 'Shopify' | 'Shopline' | 'Shoplazza' | 'Shopyy' | 'XShopyy' | 'Shoplus';
type Status = '运行中' | '已完成' | '失败' | '排队中';

interface ScrapeTask {
  id: string;
  url: string;
  platform: Platform;
  status: Status;
  progress: number;
  productsFound: number;
  createdAt: string;
}

interface Product {
  id: string;
  title: string;
  price: string;
  sourceUrl: string;
  imageUrl: string;
  platform: Platform;
  variantsCount: number;
  category: string;
  scrapedAt: string;
}

// --- Mock Data ---
const MOCK_TASKS: ScrapeTask[] = [
  { id: '任务-1004', url: 'https://cool-gadgets.myshopify.com', platform: 'Shopify', status: '运行中', progress: 68, productsFound: 142, createdAt: '10 分钟前' },
  { id: '任务-1003', url: 'https://fashion-trend.shoplineapp.com', platform: 'Shopline', status: '已完成', progress: 100, productsFound: 856, createdAt: '2 小时前' },
  { id: '任务-1002', url: 'https://home-decor.shoplazza.com', platform: 'Shoplazza', status: '失败', progress: 12, productsFound: 45, createdAt: '1 天前' },
  { id: '任务-1001', url: 'https://tech-accessories.shopyy.com', platform: 'Shopyy', status: '已完成', progress: 100, productsFound: 320, createdAt: '2 天前' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: 'PROD-891', title: '智能无线降噪耳机 Max', price: '¥1,299.00', sourceUrl: 'https://cool-gadgets.myshopify.com/products/headphones', imageUrl: 'https://picsum.photos/seed/headphones/300/300', platform: 'Shopify', variantsCount: 4, category: '数码影音', scrapedAt: '2 分钟前' },
  { id: 'PROD-892', title: '极简风纯棉短袖 T恤', price: '¥89.00', sourceUrl: 'https://fashion-trend.shoplineapp.com/tshirt', imageUrl: 'https://picsum.photos/seed/tshirt/300/300', platform: 'Shopline', variantsCount: 12, category: '男装', scrapedAt: '15 分钟前' },
  { id: 'PROD-893', title: '北欧风陶瓷咖啡杯套装', price: '¥128.00', sourceUrl: 'https://home-decor.shoplazza.com/mug-set', imageUrl: 'https://picsum.photos/seed/mug/300/300', platform: 'Shoplazza', variantsCount: 2, category: '家居用品', scrapedAt: '1 小时前' },
  { id: 'PROD-894', title: '便携式多功能露营灯', price: '¥256.00', sourceUrl: 'https://tech-accessories.shopyy.com/camp-light', imageUrl: 'https://picsum.photos/seed/light/300/300', platform: 'Shopyy', variantsCount: 3, category: '户外装备', scrapedAt: '2 小时前' },
  { id: 'PROD-895', title: '机械键盘红轴游戏专用', price: '¥499.00', sourceUrl: 'https://cool-gadgets.myshopify.com/products/keyboard', imageUrl: 'https://picsum.photos/seed/keyboard/300/300', platform: 'Shopify', variantsCount: 8, category: '电脑外设', scrapedAt: '3 小时前' },
  { id: 'PROD-896', title: '女士高腰瑜伽修身长裤', price: '¥159.00', sourceUrl: 'https://fashion-trend.shoplineapp.com/yoga-pants', imageUrl: 'https://picsum.photos/seed/yoga/300/300', platform: 'Shopline', variantsCount: 6, category: '运动瑜伽', scrapedAt: '5 小时前' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'single-scrape' | 'batch-scrape' | 'tasks' | 'products'>('dashboard');

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900">
      
      {/* --- Sidebar (Light Theme) --- */}
      <aside className="w-64 bg-white flex flex-col border-r border-slate-200 transition-all z-10 shadow-sm relative">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900 font-bold tracking-tight text-lg">星海数据采集</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            <SidebarItem 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              label="数据总览" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <SidebarItem 
              icon={<ListTodo className="w-5 h-5" />} 
              label="任务管理" 
              active={activeTab === 'tasks'} 
              onClick={() => setActiveTab('tasks')} 
            />
          </div>

          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">新建任务</h3>
            <div className="space-y-1">
              <SidebarItem 
                icon={<Link className="w-5 h-5" />} 
                label="单品链接采集" 
                active={activeTab === 'single-scrape'} 
                onClick={() => setActiveTab('single-scrape')} 
              />
              <SidebarItem 
                icon={<FolderTree className="w-5 h-5" />} 
                label="目录链接采集" 
                active={activeTab === 'batch-scrape'} 
                onClick={() => setActiveTab('batch-scrape')} 
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">数据资产</h3>
            <div className="space-y-1">
              <SidebarItem 
                icon={<PackageSearch className="w-5 h-5" />} 
                label="商品中心" 
                active={activeTab === 'products'} 
                onClick={() => setActiveTab('products')} 
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">系统设置</h3>
            <div className="space-y-1">
              <SidebarItem icon={<User className="w-5 h-5" />} label="个人中心" active={false} />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-800 mb-2">专业版权益</p>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>可用采集额度</span>
              <span className="font-medium text-slate-700">8.4k / 10k</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '84%' }}></div>
            </div>
            <button className="w-full py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors">
              升级服务额度
            </button>
          </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 relative z-0 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">
            {activeTab === 'dashboard' && '数据总览'}
            {activeTab === 'tasks' && '任务管理'}
            {activeTab === 'products' && '商品中心'}
            {activeTab === 'single-scrape' && '单品链接采集 - 【自动】'}
            {activeTab === 'batch-scrape' && '目录链接采集 - 【自动】'}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder={activeTab === 'products' ? "搜索商品名称、SKU 或分类..." : "搜索店铺域名或任务ID..."}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg text-sm w-64 transition-all outline-none"
              />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors w-9 h-9 flex items-center justify-center">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border transform translate-x-1/2 -translate-y-1/2 border-white"></span>
            </button>
            <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm cursor-pointer hover:bg-indigo-700 transition-colors">
              管
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-8 relative">
          
          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">欢迎回来，管理员</h2>
                  <p className="text-slate-500 mt-1">系统已成功为您排期并监控着 4 个活跃的 SaaS 采集任务。</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveTab('single-scrape')}
                    className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Link className="w-4 h-4" /> 单品采集
                  </button>
                  <button 
                    onClick={() => setActiveTab('batch-scrape')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all"
                  >
                    <FolderTree className="w-4 h-4" /> 目录批量采集
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="累计采集商品数" value="124,592" trend="+12.5%" isIncrease={true} icon={<Database className="w-4 h-4 text-indigo-600" />} />
                <StatCard title="正在运行任务" value="4" trend="稳定" isIncrease={true} icon={<Activity className="w-4 h-4 text-emerald-600" />} />
                <StatCard title="整体采集成功率" value="98.2%" trend="+1.1%" isIncrease={true} icon={<CheckCircle2 className="w-4 h-4 text-blue-600" />} />
                <StatCard title="系统告警提醒" value="1" trend="-2" isIncrease={false} icon={<XCircle className="w-4 h-4 text-red-600" />} />
              </div>

              {/* Recent Tasks */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-semibold text-slate-800">近期采集动态</h3>
                  <button onClick={() => setActiveTab('tasks')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    查看全部 <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <TaskTable tasks={MOCK_TASKS} />
                </div>
              </div>
            </div>
          )}

          {/* SINGLE SCRAPE PAGE */}
          {activeTab === 'single-scrape' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 text-emerald-800 text-sm">
                <Info className="w-5 h-5 shrink-0 text-emerald-600" />
                <div>
                  <strong className="font-bold">提示：</strong> 
                  如果不确定对方网站类别，请优先使用【自动】，它会自动判断系统类型并采集。若识别有误，可手动选择准确的系统类别并提交。多产品链接时，必须为同类型的系统，【不能混搭】系统类型识别以第一个产品链接为准。
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
                
                <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                  <div className="text-slate-700 font-semibold text-sm pt-2">目标系统类型</div>
                  <div className="space-y-4">
                    <PlatformRadioGroup title="默认自动" options={['自动判断 (推荐)']} defaultSelected="自动判断 (推荐)" />
                    <PlatformRadioGroup title="SAAS 独立站" options={['Shopify', '店匠 (Shoplazza)', 'Shopline', 'Shopyy', 'XShopyy', 'Shoplus']} />
                    <PlatformRadioGroup title="开源 / 自建站" options={['WooCommerce', 'Magento', 'OpenCart', 'ZenCart']} />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-8 grid grid-cols-[120px_1fr] items-start gap-4">
                  <div className="text-slate-700 font-semibold text-sm pt-2">产品链接 <br/><span className="text-slate-400 font-normal text-xs">(自动识别并采集)</span></div>
                  <div>
                    <textarea 
                      className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none resize-y"
                      placeholder="请填写单个商品链接，批量提交多个单品链接请使用【换行】分隔。&#10;例如：&#10;https://example.com/products/item-1&#10;https://example.com/products/item-2"
                    ></textarea>
                    <p className="mt-2 text-xs text-rose-500 font-medium">多个链接请使用【回车(换行)】分隔。单链接会员和试用会员只能填写一个链接。</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-8 grid grid-cols-[120px_1fr] items-start gap-4">
                  <div></div>
                  <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold shadow-sm shadow-emerald-500/20 transition-all w-max">
                    提交单品采集任务
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* BATCH DIRECTORY SCRAPE PAGE */}
          {activeTab === 'batch-scrape' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 text-emerald-800 text-sm">
                <Info className="w-5 h-5 shrink-0 text-emerald-600" />
                <div>
                  <strong className="font-bold">友情提醒：</strong> 
                  自动识别站点目录类型并采集，如果确定系统类型，也可手动选择。
                  目前支持的站点如下方单选列表所示，填入的 <span className="font-bold bg-emerald-200 px-1 rounded">链接格式</span> 请严格参照下方的表格说明。
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
                
                <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                  <div className="text-slate-700 font-semibold text-sm pt-2">目标系统类型</div>
                  <div className="space-y-4">
                    <PlatformRadioGroup title="默认自动" options={['自动判断 (推荐)']} defaultSelected="自动判断 (推荐)" />
                    <PlatformRadioGroup title="SAAS 独立站" options={['Shopify', '店匠 (Shoplazza)', 'Shopline', 'Shopyy', 'XShopyy', 'Shoplus']} />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-8 grid grid-cols-[120px_1fr] items-center gap-4">
                  <div className="text-slate-700 font-semibold text-sm">目录/整站链接</div>
                  <div>
                    <input 
                      type="url"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                      placeholder="请严格参照下方格式说明填写，例如：https://xxx.com/collections/xxx"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                  <div className="text-slate-700 font-semibold text-sm">采集商品数</div>
                  <div>
                    <input 
                      type="number"
                      className="w-full max-w-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                      placeholder="选填。填写数量应小于等于目录产品总数"
                    />
                    <span className="ml-3 text-xs text-slate-500">如果目录产品过多，可填上实际数量限制抓取</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-8 grid grid-cols-[120px_1fr] items-start gap-4">
                  <div></div>
                  <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold shadow-sm shadow-emerald-500/20 transition-all w-max">
                    提交目录采集任务
                  </button>
                </div>
              </div>

              {/* Format Guide Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-emerald-600 text-white font-semibold flex flex-col">
                  格式说明：请严格参照下面的格式说明。
                </div>
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                    <tr>
                      <th className="px-6 py-4">店铺类型</th>
                      <th className="px-6 py-4">目录格式 (优先使用)</th>
                      <th className="px-6 py-4">全站格式</th>
                      <th className="px-6 py-4">搜索格式</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">Shopify</span></td>
                      <td className="px-6 py-4 text-indigo-600 text-xs">https://xxx.com/collections/xxx类目</td>
                      <td className="px-6 py-4 text-xs">https://xxx.com/</td>
                      <td className="px-6 py-4 text-xs">https://xxx.com/search?q=xxx</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-4"><span className="bg-slate-800 text-white px-2 py-1 rounded text-xs font-bold">店匠</span></td>
                      <td className="px-6 py-4 text-indigo-600 text-xs">https://xxx.com/collections/xxx类目</td>
                      <td className="px-6 py-4 text-xs">https://xxx.com/</td>
                      <td className="px-6 py-4 text-xs">https://xxx.com/search?q=xxx</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TASKS VIEW */}
          {activeTab === 'tasks' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <select className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-3 py-2 outline-none focus:border-indigo-500 hover:border-slate-300 transition-colors cursor-pointer shadow-sm">
                    <option>所有建站平台</option>
                    <option>Shopify</option>
                    <option>Shopline</option>
                    <option>Shoplazza</option>
                  </select>
                  <select className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-3 py-2 outline-none focus:border-indigo-500 hover:border-slate-300 transition-colors cursor-pointer shadow-sm">
                    <option>所有运行状态</option>
                    <option>运行中</option>
                    <option>已完成</option>
                    <option>失败</option>
                  </select>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => setActiveTab('single-scrape')}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                  >
                    去单品采集
                  </button>
                  <button 
                    onClick={() => setActiveTab('batch-scrape')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-sm transition-all"
                  >
                    去目录采集
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                <TaskTable tasks={MOCK_TASKS} />
              </div>
            </div>
          )}

          {/* PRODUCTS VIEW */}
          {activeTab === 'products' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-2">商品数据中心</h2>
                <p className="text-sm text-slate-500 mb-5">
                  所有从独立站抓取回来的商品数据都会被统一标准化处理后保存在此。您可以跨平台搜索、筛选，并批量导出为 CSV 数据包。
                </p>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 font-semibold text-sm rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2">
                    <Filter className="w-4 h-4" /> 状态筛选
                  </button>
                  <select className="px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg outline-none focus:border-indigo-500 hover:border-slate-300 cursor-pointer shadow-sm">
                    <option>来源平台 (全部)</option>
                    <option>Shopify 数据源</option>
                    <option>Shopline 数据源</option>
                  </select>
                  <div className="flex-1"></div>
                  <button className="px-5 py-2 bg-slate-900 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-slate-800 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" /> 批量导出为 Shopify 模板格式
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600 font-medium">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4 w-10">
                        <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      </th>
                      <th className="px-6 py-4">主视图与名称</th>
                      <th className="px-6 py-4">售卖价</th>
                      <th className="px-6 py-4">业务分类</th>
                      <th className="px-6 py-4">变体数量</th>
                      <th className="px-6 py-4">来源渠道</th>
                      <th className="px-6 py-4">抓取入库时间</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_PRODUCTS.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              <img src={product.imageUrl} alt={product.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 line-clamp-1">{product.title}</div>
                              <div className="text-slate-400 text-xs mt-1">{product.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800">{product.price}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold">
                            <Tag className="w-3 h-3" /> {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {product.variantsCount} 个 SKU
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold w-max bg-indigo-50 px-2.5 py-1 rounded-md">
                            <Globe className="w-3 h-3" /> {product.platform}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs tabular-nums">
                          {product.scrapedAt}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 rounded-lg transition-all" title="查看原始来源页面">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">正在显示 1 到 6 条记录，共 124,592 条库存</span>
                  <div className="flex gap-1">
                    <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-400 font-medium disabled:opacity-50" disabled>上一页</button>
                    <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 font-medium hover:bg-slate-50">1</button>
                    <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 font-medium hover:bg-slate-50">2</button>
                    <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 font-medium hover:bg-slate-50">3</button>
                    <span className="px-2 py-1.5 text-slate-400">...</span>
                    <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 font-medium hover:bg-slate-50">下一页</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}

// --- Sub-components ---

function PlatformRadioGroup({ title, options, defaultSelected }: { title: string, options: string[], defaultSelected?: string }) {
  const [selected, setSelected] = useState(defaultSelected || '');
  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs font-semibold text-slate-400 w-24 shrink-0">{title} :</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => setSelected(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              selected === opt 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
        active 
          ? 'bg-indigo-50 text-indigo-600 font-bold' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ title, value, trend, isIncrease, icon }: { title: string, value: string, trend: string, isIncrease: boolean, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <h4 className="text-slate-500 text-sm font-semibold">{title}</h4>
        <div className={`p-1.5 rounded-lg ${isIncrease ? 'bg-emerald-50' : 'bg-red-50'}`}>{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
        <div className={`text-xs font-semibold flex items-center gap-1 ${isIncrease ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend} <span className="text-slate-400 font-medium tracking-wide">较上周环比</span>
        </div>
      </div>
    </div>
  );
}

function TaskTable({ tasks }: { tasks: ScrapeTask[] }) {
  const getStatusStyle = (status: Status) => {
    switch(status) {
      case '运行中': return 'text-indigo-600 bg-indigo-50 border-indigo-200 font-bold';
      case '已完成': return 'text-emerald-600 bg-emerald-50 border-emerald-200 font-bold';
      case '失败': return 'text-red-600 bg-red-50 border-red-200 font-bold';
      case '排队中': return 'text-slate-600 bg-slate-100 border-slate-200 font-bold';
      default: return 'text-slate-600 bg-slate-50 border-slate-200 font-bold';
    }
  };

  return (
    <table className="w-full text-left text-sm text-slate-600 font-medium">
      <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-bold tracking-wider">
        <tr>
          <th className="px-6 py-4">任务流水号 / 域名</th>
          <th className="px-6 py-4">识别平台</th>
          <th className="px-6 py-4">当前状态</th>
          <th className="px-6 py-4">采集进度</th>
          <th className="px-6 py-4">已抓取数量</th>
          <th className="px-6 py-4">触发时间</th>
          <th className="px-6 py-4 text-right">管理操作</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {tasks.map((task) => (
          <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-6 py-4">
              <div className="font-bold text-slate-800 mb-1">{task.id}</div>
              <a href="#" className="text-slate-500 text-xs hover:text-indigo-600 transition-colors flex items-center gap-1">
                {task.url.replace('https://', '')} <ArrowUpRight className="w-3 h-3" />
              </a>
            </td>
            <td className="px-6 py-4">
              <span className="inline-flex items-center px-2 py-1.5 rounded-md bg-white shadow-sm text-slate-600 text-xs font-bold border border-slate-200 tracking-wide">
                {task.platform}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs border ${getStatusStyle(task.status)}`}>
                {task.status === '运行中' && <Activity className="w-3.5 h-3.5 animate-pulse" />}
                {task.status === '已完成' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {task.status === '失败' && <XCircle className="w-3.5 h-3.5" />}
                {task.status}
              </span>
            </td>
            <td className="px-6 py-4 w-48">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full rounded-full ${task.status === '失败' ? 'bg-red-400' : 'bg-indigo-500'}`} 
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-600 w-8 tabular-nums">{task.progress}%</span>
              </div>
            </td>
            <td className="px-6 py-4 font-bold text-slate-800 text-base">
              {task.productsFound.toLocaleString()}
            </td>
            <td className="px-6 py-4 text-slate-500 text-xs">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {task.createdAt}
              </div>
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                {task.status === '已完成' && (
                  <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100" title="导出数据" aria-label="导出数据">
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <button className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
