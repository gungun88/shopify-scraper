export type Platform =
  | 'Auto Detect'
  | 'Shopify'
  | 'Shopline'
  | 'Shoplazza'
  | 'Shopyy'
  | 'XShopyy'
  | 'Shoplus';

export type Status = 'queued' | 'running' | 'completed' | 'failed';

export interface ScrapeTask {
  id: string;
  url: string;
  platform: Platform;
  status: Status;
  progress: number;
  productsFound: number;
  createdAt: string;
}

export interface Product {
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

const tasksMap = new Map<string, ScrapeTask>();
const productsMap = new Map<string, Product>();

const PRODUCT_TEMPLATES: Array<
  Omit<Product, 'id' | 'platform' | 'scrapedAt' | 'sourceUrl'>
> = [
  {
    title: 'Wireless Noise Cancelling Headphones',
    price: '$129.00',
    imageUrl: 'https://picsum.photos/seed/headphones/300/300',
    variantsCount: 4,
    category: 'Electronics',
  },
  {
    title: 'Heavyweight Cotton Tee',
    price: '$39.00',
    imageUrl: 'https://picsum.photos/seed/tshirt/300/300',
    variantsCount: 8,
    category: 'Apparel',
  },
  {
    title: 'Ceramic Mug Set',
    price: '$28.00',
    imageUrl: 'https://picsum.photos/seed/mug/300/300',
    variantsCount: 2,
    category: 'Home',
  },
  {
    title: 'Camping Lantern',
    price: '$52.00',
    imageUrl: 'https://picsum.photos/seed/light/300/300',
    variantsCount: 3,
    category: 'Outdoor',
  },
  {
    title: 'Mechanical Keyboard',
    price: '$99.00',
    imageUrl: 'https://picsum.photos/seed/keyboard/300/300',
    variantsCount: 5,
    category: 'Accessories',
  },
  {
    title: 'Performance Leggings',
    price: '$45.00',
    imageUrl: 'https://picsum.photos/seed/yoga/300/300',
    variantsCount: 6,
    category: 'Activewear',
  },
];

function nowIso(): string {
  return new Date().toISOString();
}

function generateTaskId(): string {
  return `task-${1000 + tasksMap.size + 1}`;
}

function normalizePlatform(raw: string): Platform {
  const valid: Platform[] = [
    'Auto Detect',
    'Shopify',
    'Shopline',
    'Shoplazza',
    'Shopyy',
    'XShopyy',
    'Shoplus',
  ];
  return valid.includes(raw as Platform) ? (raw as Platform) : 'Auto Detect';
}

function detectByUrl(url: string): Platform | null {
  const value = url.toLowerCase();
  if (value.includes('.myshopify.com')) return 'Shopify';
  if (value.includes('shoplineapp.com')) return 'Shopline';
  if (value.includes('.shoplazza.com')) return 'Shoplazza';
  if (value.includes('.shopyy.com')) return 'Shopyy';
  if (value.includes('.xshopyy.com')) return 'XShopyy';
  if (value.includes('.shoplus.net')) return 'Shoplus';
  return null;
}

async function detectByHtml(url: string): Promise<Platform> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timeout);

    const html = (await response.text()).toLowerCase();

    if (html.includes('cdn.shopify.com') || html.includes('window.shopify')) return 'Shopify';
    if (html.includes('shopline') || html.includes('shopline-static')) return 'Shopline';
    if (html.includes('shoplazza')) return 'Shoplazza';
    if (html.includes('xshopyy')) return 'XShopyy';
    if (html.includes('shopyy')) return 'Shopyy';
    if (html.includes('shoplus')) return 'Shoplus';
  } catch (error) {
    console.warn('[detect]', url, error instanceof Error ? error.message : error);
  }

  return 'Shopify';
}

async function autoDetectPlatform(url: string, userSelected: string): Promise<Platform> {
  const normalized = normalizePlatform(userSelected);
  if (normalized !== 'Auto Detect') {
    return normalized;
  }

  const byUrl = detectByUrl(url);
  if (byUrl) {
    return byUrl;
  }

  return detectByHtml(url);
}

function addProducts(task: ScrapeTask, count: number) {
  for (let index = 0; index < count; index += 1) {
    const template = PRODUCT_TEMPLATES[index % PRODUCT_TEMPLATES.length];
    const id = `prod-${Math.floor(Math.random() * 900000) + 100000}`;
    productsMap.set(id, {
      id,
      title: template.title,
      price: template.price,
      sourceUrl: `${task.url.replace(/\/$/, '')}/products/${id}`,
      imageUrl: `${template.imageUrl}?v=${Date.now()}-${index}`,
      platform: task.platform,
      variantsCount: template.variantsCount,
      category: template.category,
      scrapedAt: nowIso(),
    });
  }
}

function advanceTask(taskId: string) {
  setTimeout(() => {
    const task = tasksMap.get(taskId);
    if (!task || task.status !== 'running') return;

    const progress = Math.min(task.progress + 15 + Math.floor(Math.random() * 16), 100);
    const productsFound = Math.max(task.productsFound, Math.floor(progress * (1.2 + Math.random())));

    if (progress >= 100) {
      const finalCount = Math.max(productsFound, 20 + Math.floor(Math.random() * 180));
      const completedTask: ScrapeTask = {
        ...task,
        status: 'completed',
        progress: 100,
        productsFound: finalCount,
      };
      tasksMap.set(taskId, completedTask);
      addProducts(completedTask, Math.min(finalCount, 12));
      return;
    }

    tasksMap.set(taskId, {
      ...task,
      progress,
      productsFound,
    });

    advanceTask(taskId);
  }, 1800);
}

function simulateScraping(taskId: string) {
  setTimeout(() => {
    const task = tasksMap.get(taskId);
    if (!task || task.status !== 'queued') return;

    if (Math.random() < 0.06) {
      tasksMap.set(taskId, { ...task, status: 'failed' });
      return;
    }

    tasksMap.set(taskId, {
      ...task,
      status: 'running',
      progress: 8,
    });

    advanceTask(taskId);
  }, 1000);
}

async function callExternalScraper(
  endpoint: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const baseUrl = process.env.SCRAPER_API_URL?.replace(/\/$/, '');
  if (!baseUrl) {
    throw new Error('SCRAPER_API_URL is not configured');
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`External scraper error: ${response.status}`);
  }

  return (await response.json()) as Record<string, unknown>;
}

export function createSingleTask(urls: string[], platform: string): ScrapeTask {
  const task: ScrapeTask = {
    id: generateTaskId(),
    url: urls[0] ?? '',
    platform: normalizePlatform(platform),
    status: 'queued',
    progress: 0,
    productsFound: 0,
    createdAt: nowIso(),
  };

  tasksMap.set(task.id, task);

  void autoDetectPlatform(task.url, platform).then((detectedPlatform) => {
    const current = tasksMap.get(task.id);
    if (!current) return;

    tasksMap.set(task.id, { ...current, platform: detectedPlatform });

    if (!process.env.SCRAPER_API_URL) {
      simulateScraping(task.id);
      return;
    }

    void callExternalScraper('/scrape/single', { urls, platform: detectedPlatform })
      .then((result) => {
        const latest = tasksMap.get(task.id);
        if (!latest) return;

        const items = Array.isArray(result.products) ? (result.products as Product[]) : [];
        items.forEach((item) => productsMap.set(item.id, item));

        tasksMap.set(task.id, {
          ...latest,
          status: 'completed',
          progress: 100,
          productsFound:
            typeof result.productsFound === 'number' ? result.productsFound : items.length,
        });
      })
      .catch(() => {
        const latest = tasksMap.get(task.id);
        if (!latest) return;
        tasksMap.set(task.id, { ...latest, status: 'failed' });
      });
  });

  return task;
}

export function createBatchTask(url: string, platform: string, limit?: number): ScrapeTask {
  const task: ScrapeTask = {
    id: generateTaskId(),
    url,
    platform: normalizePlatform(platform),
    status: 'queued',
    progress: 0,
    productsFound: 0,
    createdAt: nowIso(),
  };

  tasksMap.set(task.id, task);

  void autoDetectPlatform(url, platform).then((detectedPlatform) => {
    const current = tasksMap.get(task.id);
    if (!current) return;

    tasksMap.set(task.id, { ...current, platform: detectedPlatform });

    if (!process.env.SCRAPER_API_URL) {
      simulateScraping(task.id);
      return;
    }

    void callExternalScraper('/scrape/batch', { url, platform: detectedPlatform, limit })
      .then((result) => {
        const latest = tasksMap.get(task.id);
        if (!latest) return;

        const items = Array.isArray(result.products) ? (result.products as Product[]) : [];
        items.forEach((item) => productsMap.set(item.id, item));

        tasksMap.set(task.id, {
          ...latest,
          status: 'completed',
          progress: 100,
          productsFound:
            typeof result.productsFound === 'number' ? result.productsFound : items.length,
        });
      })
      .catch(() => {
        const latest = tasksMap.get(task.id);
        if (!latest) return;
        tasksMap.set(task.id, { ...latest, status: 'failed' });
      });
  });

  return task;
}

export function getTasks(): ScrapeTask[] {
  return Array.from(tasksMap.values()).sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );
}

export function getTask(id: string): ScrapeTask | undefined {
  return tasksMap.get(id);
}

export function getProducts(
  page: number,
  pageSize: number,
): { items: Product[]; total: number; page: number; pageSize: number } {
  const items = Array.from(productsMap.values()).sort(
    (left, right) => Date.parse(right.scrapedAt) - Date.parse(left.scrapedAt),
  );
  const startIndex = (page - 1) * pageSize;

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}

(function seedData() {
  const tasks: ScrapeTask[] = [
    {
      id: 'task-1001',
      url: 'https://cool-gadgets.myshopify.com',
      platform: 'Shopify',
      status: 'completed',
      progress: 100,
      productsFound: 86,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-1002',
      url: 'https://fashion-trend.shoplineapp.com/collections/all',
      platform: 'Shopline',
      status: 'completed',
      progress: 100,
      productsFound: 43,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-1003',
      url: 'https://home-living.shoplazza.com',
      platform: 'Shoplazza',
      status: 'failed',
      progress: 24,
      productsFound: 9,
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    },
  ];

  tasks.forEach((task) => tasksMap.set(task.id, task));

  const products: Product[] = [
    {
      id: 'prod-1001',
      title: 'Wireless Noise Cancelling Headphones',
      price: '$129.00',
      sourceUrl: 'https://cool-gadgets.myshopify.com/products/headphones',
      imageUrl: 'https://picsum.photos/seed/headphones/300/300',
      platform: 'Shopify',
      variantsCount: 4,
      category: 'Electronics',
      scrapedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: 'prod-1002',
      title: 'Heavyweight Cotton Tee',
      price: '$39.00',
      sourceUrl: 'https://fashion-trend.shoplineapp.com/products/tee',
      imageUrl: 'https://picsum.photos/seed/tshirt/300/300',
      platform: 'Shopline',
      variantsCount: 8,
      category: 'Apparel',
      scrapedAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    },
    {
      id: 'prod-1003',
      title: 'Ceramic Mug Set',
      price: '$28.00',
      sourceUrl: 'https://home-living.shoplazza.com/products/mug-set',
      imageUrl: 'https://picsum.photos/seed/mug/300/300',
      platform: 'Shoplazza',
      variantsCount: 2,
      category: 'Home',
      scrapedAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    },
    {
      id: 'prod-1004',
      title: 'Camping Lantern',
      price: '$52.00',
      sourceUrl: 'https://cool-gadgets.myshopify.com/products/camping-lantern',
      imageUrl: 'https://picsum.photos/seed/light/300/300',
      platform: 'Shopify',
      variantsCount: 3,
      category: 'Outdoor',
      scrapedAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    },
  ];

  products.forEach((product) => productsMap.set(product.id, product));
})();
