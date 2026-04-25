import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Database,
  FolderTree,
  Info,
  Link as LinkIcon,
  Loader2,
  Package,
  RefreshCw,
  ShoppingBag,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { Product, ScrapeTask, tasksApi } from './api/client';
import { useProducts } from './hooks/useProducts';
import { useTasks } from './hooks/useTasks';

type Tab = 'dashboard' | 'single' | 'batch' | 'tasks' | 'products';
type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

const PLATFORM_OPTIONS = [
  'Auto Detect',
  'Shopify',
  'Shopline',
  'Shoplazza',
  'Shopyy',
  'XShopyy',
  'Shoplus',
] as const;

function formatDate(value: string): string {
  return new Date(value).toLocaleString('zh-CN', { hour12: false });
}

function statusLabel(status: ScrapeTask['status']): string {
  switch (status) {
    case 'queued':
      return '排队中';
    case 'running':
      return '运行中';
    case 'completed':
      return '已完成';
    case 'failed':
      return '失败';
    default:
      return status;
  }
}

function statusClasses(status: ScrapeTask['status']): string {
  switch (status) {
    case 'queued':
      return 'bg-slate-100 text-slate-700';
    case 'running':
      return 'bg-amber-100 text-amber-700';
    case 'completed':
      return 'bg-emerald-100 text-emerald-700';
    case 'failed':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function Toasts({
  messages,
  onDismiss,
}: {
  messages: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  if (messages.length === 0) return null;

  return (
    <div className="fixed right-5 top-5 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : message.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-900'
                : 'border-sky-200 bg-sky-50 text-sky-900'
          }`}
        >
          {message.type === 'success' && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
          {message.type === 'error' && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          {message.type === 'info' && <Info className="mt-0.5 h-4 w-4 shrink-0" />}
          <div className="flex-1 text-sm font-medium">{message.text}</div>
          <button
            type="button"
            onClick={() => onDismiss(message.id)}
            className="rounded-full p-1 opacity-60 transition hover:bg-white/60 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-sm text-slate-400">{hint}</div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-950">{title}</h2>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const nextIdRef = useRef(0);

  const push = (type: ToastType, text: string) => {
    const id = nextIdRef.current + 1;
    nextIdRef.current = id;
    setMessages((current) => [...current, { id, type, text }]);
    window.setTimeout(() => {
      setMessages((current) => current.filter((item) => item.id !== id));
    }, 4000);
  };

  const dismiss = (id: number) => {
    setMessages((current) => current.filter((item) => item.id !== id));
  };

  return { messages, push, dismiss };
}

function TaskTable({ tasks }: { tasks: ScrapeTask[] }) {
  if (tasks.length === 0) {
    return <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">还没有任务记录。</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400">
            <th className="px-4 py-3 font-semibold">任务</th>
            <th className="px-4 py-3 font-semibold">平台</th>
            <th className="px-4 py-3 font-semibold">状态</th>
            <th className="px-4 py-3 font-semibold">进度</th>
            <th className="px-4 py-3 font-semibold">商品数</th>
            <th className="px-4 py-3 font-semibold">创建时间</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b border-slate-50 align-top last:border-b-0">
              <td className="px-4 py-4">
                <div className="font-semibold text-slate-900">{task.id}</div>
                <div className="mt-1 max-w-[360px] break-all text-xs text-slate-500">{task.url}</div>
              </td>
              <td className="px-4 py-4 text-slate-700">{task.platform}</td>
              <td className="px-4 py-4">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClasses(task.status)}`}>
                  {statusLabel(task.status)}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="w-36">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{task.progress}%</span>
                    <span>{task.status === 'completed' ? 'done' : 'live'}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${
                        task.status === 'failed'
                          ? 'bg-rose-400'
                          : task.status === 'completed'
                            ? 'bg-emerald-500'
                            : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.max(4, task.progress)}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 font-semibold text-slate-900">{task.productsFound}</td>
              <td className="px-4 py-4 text-slate-500">{formatDate(task.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductTable({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">还没有采集到商品。</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400">
            <th className="px-4 py-3 font-semibold">商品</th>
            <th className="px-4 py-3 font-semibold">价格</th>
            <th className="px-4 py-3 font-semibold">平台</th>
            <th className="px-4 py-3 font-semibold">分类</th>
            <th className="px-4 py-3 font-semibold">变体数</th>
            <th className="px-4 py-3 font-semibold">采集时间</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-slate-50 align-top last:border-b-0">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 rounded-2xl bg-slate-100 object-cover"
                  />
                  <div>
                    <div className="max-w-[300px] font-semibold text-slate-900">{product.title}</div>
                    <a
                      href={product.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block max-w-[300px] break-all text-xs text-slate-500 underline decoration-slate-200 underline-offset-2"
                    >
                      {product.sourceUrl}
                    </a>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 font-semibold text-slate-900">{product.price}</td>
              <td className="px-4 py-4 text-slate-700">{product.platform}</td>
              <td className="px-4 py-4 text-slate-700">{product.category}</td>
              <td className="px-4 py-4 text-slate-700">{product.variantsCount}</td>
              <td className="px-4 py-4 text-slate-500">{formatDate(product.scrapedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [singlePlatform, setSinglePlatform] = useState<string>('Auto Detect');
  const [singleUrls, setSingleUrls] = useState('');
  const [singleSubmitting, setSingleSubmitting] = useState(false);
  const [batchPlatform, setBatchPlatform] = useState<string>('Auto Detect');
  const [batchUrl, setBatchUrl] = useState('');
  const [batchLimit, setBatchLimit] = useState('');
  const [batchSubmitting, setBatchSubmitting] = useState(false);

  const { tasks, isLoading: tasksLoading, error: tasksError, refresh: refreshTasks } = useTasks();
  const {
    products,
    total: productsTotal,
    page: productsPage,
    totalPages,
    isLoading: productsLoading,
    error: productsError,
    setPage: setProductsPage,
    refresh: refreshProducts,
  } = useProducts(1, 12);

  useEffect(() => {
    if (tasksError) toast.push('error', `任务列表加载失败: ${tasksError}`);
  }, [tasksError]);

  useEffect(() => {
    if (productsError) toast.push('error', `商品列表加载失败: ${productsError}`);
  }, [productsError]);

  const runningCount = tasks.filter((task) => task.status === 'running').length;
  const queuedCount = tasks.filter((task) => task.status === 'queued').length;
  const completedCount = tasks.filter((task) => task.status === 'completed').length;
  const failedCount = tasks.filter((task) => task.status === 'failed').length;

  const handleSingleSubmit = async () => {
    const urls = singleUrls
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (urls.length === 0) {
      toast.push('error', '请至少输入一个商品链接。');
      return;
    }

    setSingleSubmitting(true);
    try {
      const task = await tasksApi.createSingle({ urls, platform: singlePlatform });
      toast.push('success', `单品任务已提交: ${task.id}`);
      setSingleUrls('');
      refreshTasks();
      setActiveTab('tasks');
    } catch (error) {
      toast.push('error', `提交失败: ${(error as Error).message}`);
    } finally {
      setSingleSubmitting(false);
    }
  };

  const handleBatchSubmit = async () => {
    if (!batchUrl.trim()) {
      toast.push('error', '请填写目录页或站点链接。');
      return;
    }

    const parsedLimit = batchLimit.trim() ? Number(batchLimit) : undefined;
    if (parsedLimit !== undefined && (!Number.isInteger(parsedLimit) || parsedLimit <= 0)) {
      toast.push('error', '抓取数量上限必须是正整数。');
      return;
    }

    setBatchSubmitting(true);
    try {
      const task = await tasksApi.createBatch({
        url: batchUrl.trim(),
        platform: batchPlatform,
        limit: parsedLimit,
      });
      toast.push('success', `目录任务已提交: ${task.id}`);
      setBatchUrl('');
      setBatchLimit('');
      refreshTasks();
      setActiveTab('tasks');
    } catch (error) {
      toast.push('error', `提交失败: ${(error as Error).message}`);
    } finally {
      setBatchSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
      <Toasts messages={toast.messages} onDismiss={toast.dismiss} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[32px] border border-slate-200 bg-white/80 px-6 py-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Shopify Scraper</div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950">采集任务控制台</h1>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm text-slate-500">
                上次修改时 `App.tsx` 已经被编码损坏。现在这套页面是新的可编译基线，后续可以继续在这里追 bug 和补功能。
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'dashboard', label: '概览', icon: Database },
                { id: 'single', label: '单品采集', icon: LinkIcon },
                { id: 'batch', label: '批量采集', icon: FolderTree },
                { id: 'tasks', label: '任务列表', icon: ClipboardList },
                { id: 'products', label: '商品列表', icon: ShoppingBag },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id as Tab)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === id
                      ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="任务总数" value={tasks.length} hint="所有已创建抓取任务" />
              <MetricCard label="运行中" value={runningCount} hint={`排队中 ${queuedCount} 个`} />
              <MetricCard label="已完成" value={completedCount} hint={`失败 ${failedCount} 个`} />
              <MetricCard label="商品总数" value={productsTotal} hint="来自当前 mock API" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <SectionCard
                title="最近任务"
                description="这里会自动轮询正在运行和排队中的任务。"
                action={
                  <button
                    type="button"
                    onClick={refreshTasks}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    <RefreshCw className={`h-4 w-4 ${tasksLoading ? 'animate-spin' : ''}`} />
                    刷新任务
                  </button>
                }
              >
                <TaskTable tasks={tasks.slice(0, 5)} />
              </SectionCard>

              <SectionCard
                title="最近商品"
                description="展示最近采集入库的商品。"
                action={
                  <button
                    type="button"
                    onClick={refreshProducts}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    <RefreshCw className={`h-4 w-4 ${productsLoading ? 'animate-spin' : ''}`} />
                    刷新商品
                  </button>
                }
              >
                <div className="space-y-3">
                  {products.slice(0, 4).map((product) => (
                    <div key={product.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        className="h-14 w-14 rounded-2xl bg-slate-100 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-slate-900">{product.title}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {product.platform} · {product.price}
                        </div>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
                      还没有商品数据。
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {activeTab === 'single' && (
          <SectionCard title="单品采集" description="一行一个 URL，提交后会创建单品抓取任务。">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4 rounded-3xl bg-slate-50 p-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">平台</label>
                  <select
                    value={singlePlatform}
                    onChange={(event) => setSinglePlatform(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0"
                  >
                    {PLATFORM_OPTIONS.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                  支持 `Shopify`、`Shopline`、`Shoplazza` 等平台，也可以先选 `Auto Detect` 让后端自动识别。
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">商品链接</label>
                  <textarea
                    rows={10}
                    value={singleUrls}
                    onChange={(event) => setSingleUrls(event.target.value)}
                    placeholder={'https://example.com/products/item-1\nhttps://example.com/products/item-2'}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none ring-0"
                  />
                </div>
                <button
                  type="button"
                  disabled={singleSubmitting}
                  onClick={handleSingleSubmit}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {singleSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  提交单品任务
                </button>
              </div>
            </div>
          </SectionCard>
        )}

        {activeTab === 'batch' && (
          <SectionCard title="批量采集" description="输入目录页、集合页或站点链接，生成批量抓取任务。">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4 rounded-3xl bg-slate-50 p-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">平台</label>
                  <select
                    value={batchPlatform}
                    onChange={(event) => setBatchPlatform(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0"
                  >
                    {PLATFORM_OPTIONS.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                  `limit` 可以留空。留空时由 mock 服务端自己决定最终采集数量。
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">目录页或站点链接</label>
                  <input
                    type="url"
                    value={batchUrl}
                    onChange={(event) => setBatchUrl(event.target.value)}
                    placeholder="https://example.com/collections/all"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">抓取数量上限</label>
                  <input
                    type="number"
                    min={1}
                    value={batchLimit}
                    onChange={(event) => setBatchLimit(event.target.value)}
                    placeholder="100"
                    className="w-full max-w-[240px] rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0"
                  />
                </div>
                <button
                  type="button"
                  disabled={batchSubmitting}
                  onClick={handleBatchSubmit}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {batchSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderTree className="h-4 w-4" />}
                  提交批量任务
                </button>
              </div>
            </div>
          </SectionCard>
        )}

        {activeTab === 'tasks' && (
          <SectionCard
            title="任务列表"
            description="任务状态会根据后端轮询自动更新。"
            action={
              <button
                type="button"
                onClick={refreshTasks}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                <RefreshCw className={`h-4 w-4 ${tasksLoading ? 'animate-spin' : ''}`} />
                刷新
              </button>
            }
          >
            <TaskTable tasks={tasks} />
          </SectionCard>
        )}

        {activeTab === 'products' && (
          <SectionCard
            title="商品列表"
            description={`当前共 ${productsTotal} 个商品，第 ${productsPage} / ${Math.max(totalPages, 1)} 页。`}
            action={
              <button
                type="button"
                onClick={refreshProducts}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                <RefreshCw className={`h-4 w-4 ${productsLoading ? 'animate-spin' : ''}`} />
                刷新
              </button>
            }
          >
            <ProductTable products={products} />
            <div className="mt-5 flex items-center justify-between">
              <div className="text-sm text-slate-500">mock API 分页已接通，可继续在这里加筛选、导出等功能。</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={productsPage <= 1}
                  onClick={() => setProductsPage(productsPage - 1)}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  上一页
                </button>
                <button
                  type="button"
                  disabled={productsPage >= totalPages}
                  onClick={() => setProductsPage(productsPage + 1)}
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            </div>
          </SectionCard>
        )}

        {(tasksLoading || productsLoading) && (
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            正在同步最新数据...
          </div>
        )}
      </div>
    </div>
  );
}
