import { hash } from "bcryptjs";
import { PrismaClient, ArticleStatus } from "../src/generated/prisma";

const prisma = new PrismaClient();

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function main() {
  await prisma.articleTag.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const [evaPasswordHash, marekPasswordHash] = await Promise.all([
    hash("heslo123", 12),
    hash("heslo123", 12),
  ]);

  const eva = await prisma.user.create({
    data: {
      email: "eva@toulky.cz",
      name: "Eva Horáková",
      passwordHash: evaPasswordHash,
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80",
    },
  });

  const marek = await prisma.user.create({
    data: {
      email: "marek@toulky.cz",
      name: "Marek Kříž",
      passwordHash: marekPasswordHash,
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80",
    },
  });

  const evaCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Víkend v Evropě",
        slug: "vikend-v-evrope",
        description: "Krátké výlety po městech, která stihnete za dva až tři dny.",
        userId: eva.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Hory a treky",
        slug: "hory-a-treky",
        description: "Horské trasy, výstupy a vícedenní přechody.",
        userId: eva.id,
      },
    }),
  ]);

  const marekCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Roadtrip",
        slug: "roadtrip",
        description: "Dlouhé přesuny autem, itineráře a zastávky po cestě.",
        userId: marek.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Kavárny a města",
        slug: "kavarny-a-mesta",
        description: "Pomalejší městské cestování s důrazem na lokální atmosféru.",
        userId: marek.id,
      },
    }),
  ]);

  const evaTags = await Promise.all([
    prisma.tag.create({ data: { name: "vlakem", slug: "vlakem", userId: eva.id } }),
    prisma.tag.create({ data: { name: "rozpočet", slug: "rozpocet", userId: eva.id } }),
    prisma.tag.create({ data: { name: "výhledy", slug: "vyhledy", userId: eva.id } }),
  ]);

  const marekTags = await Promise.all([
    prisma.tag.create({ data: { name: "roadtrip", slug: "roadtrip", userId: marek.id } }),
    prisma.tag.create({ data: { name: "kavárny", slug: "kavarny", userId: marek.id } }),
    prisma.tag.create({ data: { name: "fotospoty", slug: "fotospoty", userId: marek.id } }),
  ]);

  const articles = [
    {
      user: eva,
      title: "48 hodin v Kodani bez auta",
      slug: "48-hodin-v-kodani-bez-auta",
      excerpt:
        "Praktický itinerář pro rychlý městský výlet: čtvrti, kavárny, trasy pěšky i tipy na rozumný rozpočet.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=1200&q=80",
      contentHtml:
        "<p>Kodaň je ideální město na prodloužený víkend. Z letiště se rychle dostanete do centra, většinu míst zvládnete pěšky a díky husté síti vlaků není potřeba řešit auto.</p><p>První den věnujte čtvrtím Nyhavn a Christianshavn, druhý den si nechte na muzeum designu, Torvehallerne a podvečerní procházku kolem jezer.</p><p>V článku najdete i konkrétní tipy na levnější brunch, vyhlídky zdarma a trasu, která dává smysl časově i logisticky.</p>",
      status: ArticleStatus.PUBLISHED,
      publishDate: daysAgo(7),
      categoryId: evaCategories[0].id,
      tagIds: [evaTags[0].id, evaTags[1].id],
    },
    {
      user: eva,
      title: "Tatranský víkend pro začátečníky",
      slug: "tatransky-vikend-pro-zacatecniky",
      excerpt:
        "Dvě lehčí túry, jedno horské ubytování a plán, který funguje i bez auta a bez extrémní kondice.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1508261303786-2d7dbd84e557?auto=format&fit=crop&w=1200&q=80",
      contentHtml:
        "<p>Pokud chcete ochutnat Vysoké Tatry bez náročné logistiky, vyplatí se ubytovat u železniční zastávky a držet se dvou lehčích tras.</p><p>První den doporučuji Popradské pleso, druhý den Štrbské pleso a nenáročný výstup k vodopádům. Díky tomu stihnete výhledy i návrat domů v neděli večer.</p>",
      status: ArticleStatus.PUBLISHED,
      publishDate: daysAgo(21),
      categoryId: evaCategories[1].id,
      tagIds: [evaTags[0].id, evaTags[2].id],
    },
    {
      user: eva,
      title: "Jak si naplánovat podzimní výlet do Alp",
      slug: "jak-si-naplanovat-podzimni-vylet-do-alp",
      excerpt:
        "Checklist na počasí, vrstvení, přespání a bezpečný výběr tras mimo hlavní letní sezónu.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      contentHtml:
        "<p>Podzim v Alpách je klidnější, ale vyžaduje pečlivější plán. Důležité je sledovat sněhovou hranici, provoz lanovek a otevírací dobu horských chat.</p><p>Tento draft článek slouží jako ukázka neveřejného obsahu v CMS.</p>",
      status: ArticleStatus.DRAFT,
      publishDate: null,
      categoryId: evaCategories[1].id,
      tagIds: [evaTags[2].id],
    },
    {
      user: marek,
      title: "Pomalý roadtrip po severní Itálii",
      slug: "pomaly-roadtrip-po-severni-italii",
      excerpt:
        "Čtyřdenní trasa mezi jezery, malými městy a místy, kde dává smysl zastavit kvůli výhledu i kávě.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      contentHtml:
        "<p>Severní Itálie funguje skvěle i mimo hlavní sezónu. Pokud si trasu rozložíte mezi Lago di Garda, Bergamo a Veronu, vyhnete se zbytečnému přejezdu a zůstane prostor na spontánní zastávky.</p><p>V textu najdete doporučené úseky, parkování i tip na ubytování na dvě noci v jedné základně.</p>",
      status: ArticleStatus.PUBLISHED,
      publishDate: daysAgo(12),
      categoryId: marekCategories[0].id,
      tagIds: [marekTags[0].id, marekTags[2].id],
    },
    {
      user: marek,
      title: "Lisabon: kavárny, výhledy a tramvaje",
      slug: "lisabon-kavarny-vyhledy-a-tramvaje",
      excerpt:
        "Městský průvodce pro ty, kdo chtějí kombinovat pomalé tempo, hezká zákoutí a přehlednou trasu po čtvrtích.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=1200&q=80",
      contentHtml:
        "<p>Lisabon je ideální město na tři dny. Stačí si chytře rozdělit Alfamu, Bairro Alto a Belém tak, abyste zbytečně nepřejížděli sem a tam.</p><p>Nejlepší zážitky často nejsou v nejznámějších kavárnách, ale v menších podnicích mimo hlavní proud turistů. V článku je najdete i s konkrétní trasou.</p>",
      status: ArticleStatus.PUBLISHED,
      publishDate: daysAgo(3),
      categoryId: marekCategories[1].id,
      tagIds: [marekTags[1].id, marekTags[2].id],
    },
  ];

  for (const article of articles) {
    const createdArticle = await prisma.article.create({
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        contentHtml: article.contentHtml,
        coverImageUrl: article.coverImageUrl,
        status: article.status,
        publishDate: article.publishDate,
        authorId: article.user.id,
        categoryId: article.categoryId,
      },
    });

    await prisma.articleTag.createMany({
      data: article.tagIds.map((tagId) => ({
        articleId: createdArticle.id,
        tagId,
      })),
    });
  }

  console.log("Seed completed.");
  console.log("Demo účty:");
  console.log("eva@toulky.cz / heslo123");
  console.log("marek@toulky.cz / heslo123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
