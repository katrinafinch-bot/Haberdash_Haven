// ═══════════════════════════════════════════════════════════
// HABERDASH HAVEN — Internationalization (i18n)
// Drop this file into src/ alongside App.jsx
// Import in App.jsx: import { t, LANGUAGES } from './i18n.js'
// ═══════════════════════════════════════════════════════════

export const LANGUAGES = [
  { code: 'en-US', label: 'English (US)',       flag: '🇺🇸', dir: 'ltr' },
  { code: 'en-GB', label: 'English (UK)',       flag: '🇬🇧', dir: 'ltr' },
  { code: 'de',    label: 'Deutsch',            flag: '🇩🇪', dir: 'ltr' },
  { code: 'fr',    label: 'Français',           flag: '🇫🇷', dir: 'ltr' },
  { code: 'nl',    label: 'Nederlands',         flag: '🇳🇱', dir: 'ltr' },
  { code: 'es',    label: 'Español',            flag: '🇪🇸', dir: 'ltr' },
  { code: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷', dir: 'ltr' },
  { code: 'ja',    label: '日本語',              flag: '🇯🇵', dir: 'ltr' },
  { code: 'ko',    label: '한국어',              flag: '🇰🇷', dir: 'ltr' },
  { code: 'zh-CN', label: '中文（简体）',        flag: '🇨🇳', dir: 'ltr' },
];

// ── Translation strings ────────────────────────────────────
const translations = {

  // ── Navigation ────────────────────────────────────────────
  nav_home:          { 'en-US':'Home',        'en-GB':'Home',        'de':'Startseite',  'fr':'Accueil',    'nl':'Thuis',       'es':'Inicio',      'pt-BR':'Início',    'ja':'ホーム',     'ko':'홈',       'zh-CN':'主页'   },
  nav_match:         { 'en-US':'Match',        'en-GB':'Match',       'de':'Suche',       'fr':'Chercher',   'nl':'Zoeken',      'es':'Buscar',      'pt-BR':'Buscar',    'ja':'検索',       'ko':'검색',     'zh-CN':'查找'   },
  nav_stash:         { 'en-US':'Stash',        'en-GB':'Stash',       'de':'Vorrat',      'fr':'Stash',      'nl':'Voorraad',    'es':'Inventario',  'pt-BR':'Estoque',   'ja':'在庫',       'ko':'재고',     'zh-CN':'库存'   },
  nav_more:          { 'en-US':'More',         'en-GB':'More',        'de':'Mehr',        'fr':'Plus',       'nl':'Meer',        'es':'Más',         'pt-BR':'Mais',      'ja':'その他',     'ko':'더보기',   'zh-CN':'更多'   },

  // ── Home ──────────────────────────────────────────────────
  home_welcome:      { 'en-US':'Welcome back ✿', 'en-GB':'Welcome back ✿', 'de':'Willkommen zurück ✿', 'fr':'Bienvenue ✿', 'nl':'Welkom terug ✿', 'es':'Bienvenida ✿', 'pt-BR':'Bem-vinda ✿', 'ja':'おかえり ✿', 'ko':'돌아오셨군요 ✿', 'zh-CN':'欢迎回来 ✿' },
  home_low_stock:    { 'en-US':'Low stock',    'en-GB':'Low stock',   'de':'Niedriger Bestand', 'fr':'Stock faible', 'nl':'Weinig voorraad', 'es':'Poco stock', 'pt-BR':'Estoque baixo', 'ja':'在庫少', 'ko':'재고 부족', 'zh-CN':'库存不足' },
  home_below_target: { 'en-US':'Below target', 'en-GB':'Below target', 'de':'Unter Ziel', 'fr':'Sous objectif', 'nl':'Onder doel', 'es':'Bajo objetivo', 'pt-BR':'Abaixo do alvo', 'ja':'目標以下', 'ko':'목표 미달', 'zh-CN':'低于目标' },
  home_shopping_list:{ 'en-US':'Shopping list','en-GB':'Shopping list','de':'Einkaufsliste', 'fr':'Liste de courses', 'nl':'Boodschappenlijst', 'es':'Lista de compras', 'pt-BR':'Lista de compras', 'ja':'買い物リスト', 'ko':'쇼핑 목록', 'zh-CN':'购物清单' },
  home_quick_actions:{ 'en-US':'Quick actions','en-GB':'Quick actions','de':'Schnellzugriff', 'fr':'Actions rapides', 'nl':'Snelle acties', 'es':'Acciones rápidas', 'pt-BR':'Ações rápidas', 'ja':'クイックアクション', 'ko':'빠른 동작', 'zh-CN':'快捷操作' },

  // ── Match tab ─────────────────────────────────────────────
  match_title:       { 'en-US':'Thread Match',  'en-GB':'Thread Match', 'de':'Faden suchen', 'fr':'Recherche de fil', 'nl':'Draad zoeken', 'es':'Buscar hilo', 'pt-BR':'Buscar linha', 'ja':'糸を探す', 'ko':'실 찾기', 'zh-CN':'查找线材' },
  match_simple:      { 'en-US':'Simple Match',  'en-GB':'Simple Match', 'de':'Einfache Suche', 'fr':'Recherche simple', 'nl':'Eenvoudig zoeken', 'es':'Búsqueda simple', 'pt-BR':'Busca simples', 'ja':'シンプル検索', 'ko':'단순 검색', 'zh-CN':'简单搜索' },
  match_camera:      { 'en-US':'Camera Match',  'en-GB':'Camera Match', 'de':'Kamera-Suche', 'fr':'Correspondance par caméra', 'nl':'Camerazoeken', 'es':'Búsqueda por cámara', 'pt-BR':'Busca por câmera', 'ja':'カメラ検索', 'ko':'카메라 검색', 'zh-CN':'相机匹配' },
  match_brand:       { 'en-US':'Thread Brand',  'en-GB':'Thread Brand', 'de':'Fadenmarke', 'fr':'Marque de fil', 'nl':'Draadmerk', 'es':'Marca de hilo', 'pt-BR':'Marca de linha', 'ja':'糸のブランド', 'ko':'실 브랜드', 'zh-CN':'线材品牌' },
  match_color_family:{ 'en-US':'Color Family',  'en-GB':'Colour Family','de':'Farbfamilie', 'fr':'Famille de couleur', 'nl':'Kleurfamilie', 'es':'Familia de colores', 'pt-BR':'Família de cores', 'ja':'カラーファミリー', 'ko':'색상 계열', 'zh-CN':'颜色系列' },
  match_search:      { 'en-US':'Search (name, code, barcode)', 'en-GB':'Search (name, code, barcode)', 'de':'Suchen (Name, Code, Barcode)', 'fr':'Rechercher (nom, code, code-barres)', 'nl':'Zoeken (naam, code, barcode)', 'es':'Buscar (nombre, código, código de barras)', 'pt-BR':'Buscar (nome, código, código de barras)', 'ja':'検索（名前、コード、バーコード）', 'ko':'검색 (이름, 코드, 바코드)', 'zh-CN':'搜索（名称、代码、条形码）' },
  match_no_results:  { 'en-US':'No matches found.',  'en-GB':'No matches found.', 'de':'Keine Ergebnisse gefunden.', 'fr':'Aucun résultat trouvé.', 'nl':'Geen resultaten gevonden.', 'es':'No se encontraron resultados.', 'pt-BR':'Nenhum resultado encontrado.', 'ja':'結果が見つかりませんでした。', 'ko':'결과를 찾을 수 없습니다.', 'zh-CN':'未找到匹配项。' },
  match_add_stash:   { 'en-US':'+ Add to Stash', 'en-GB':'+ Add to Stash', 'de':'+ Zum Vorrat', 'fr':'+ Ajouter au stash', 'nl':'+ Toevoegen aan voorraad', 'es':'+ Agregar al inventario', 'pt-BR':'+ Adicionar ao estoque', 'ja':'+ 在庫に追加', 'ko':'+ 재고에 추가', 'zh-CN':'+ 加入库存' },
  match_add_project: { 'en-US':'Add to Project', 'en-GB':'Add to Project', 'de':'Zum Projekt', 'fr':'Ajouter au projet', 'nl':'Toevoegen aan project', 'es':'Agregar al proyecto', 'pt-BR':'Adicionar ao projeto', 'ja':'プロジェクトに追加', 'ko':'프로젝트에 추가', 'zh-CN':'添加到项目' },
  match_shopping:    { 'en-US':'Shopping List', 'en-GB':'Shopping List', 'de':'Einkaufsliste', 'fr':'Liste de courses', 'nl':'Boodschappenlijst', 'es':'Lista de compras', 'pt-BR':'Lista de compras', 'ja':'買い物リスト', 'ko':'쇼핑 목록', 'zh-CN':'购物清单' },
  match_scan:        { 'en-US':'📷 Scan Thread Barcode', 'en-GB':'📷 Scan Thread Barcode', 'de':'📷 Faden-Barcode scannen', 'fr':'📷 Scanner le code-barres du fil', 'nl':'📷 Draad-barcode scannen', 'es':'📷 Escanear código de barras del hilo', 'pt-BR':'📷 Escanear código de barras da linha', 'ja':'📷 糸のバーコードをスキャン', 'ko':'📷 실 바코드 스캔', 'zh-CN':'📷 扫描线材条形码' },
  match_add_manual:  { 'en-US':'+ Add a thread manually', 'en-GB':'+ Add a thread manually', 'de':'+ Faden manuell hinzufügen', 'fr':'+ Ajouter un fil manuellement', 'nl':'+ Draad handmatig toevoegen', 'es':'+ Agregar hilo manualmente', 'pt-BR':'+ Adicionar linha manualmente', 'ja':'+ 手動で糸を追加', 'ko':'+ 수동으로 실 추가', 'zh-CN':'+ 手动添加线材' },

  // ── Stash tab ─────────────────────────────────────────────
  stash_title:       { 'en-US':'Your Stash',    'en-GB':'Your Stash',  'de':'Ihr Vorrat',  'fr':'Votre stash', 'nl':'Uw voorraad', 'es':'Tu inventario', 'pt-BR':'Seu estoque', 'ja':'あなたの在庫', 'ko':'내 재고', 'zh-CN':'我的库存' },
  stash_threads:     { 'en-US':'Threads',        'en-GB':'Threads',     'de':'Fäden',       'fr':'Fils',       'nl':'Draden',      'es':'Hilos',       'pt-BR':'Linhas',     'ja':'糸',         'ko':'실',       'zh-CN':'线材'   },
  stash_rulers:      { 'en-US':'Rulers',         'en-GB':'Rulers',      'de':'Lineale',     'fr':'Règles',     'nl':'Linealen',    'es':'Reglas',      'pt-BR':'Réguas',     'ja':'定規',       'ko':'자',       'zh-CN':'尺子'   },
  stash_machines:    { 'en-US':'Machines',       'en-GB':'Machines',    'de':'Maschinen',   'fr':'Machines',   'nl':'Machines',    'es':'Máquinas',    'pt-BR':'Máquinas',   'ja':'ミシン',     'ko':'재봉틀',   'zh-CN':'机器'   },
  stash_accuquilt:   { 'en-US':'AccuQuilt',      'en-GB':'AccuQuilt',   'de':'AccuQuilt',   'fr':'AccuQuilt',  'nl':'AccuQuilt',   'es':'AccuQuilt',   'pt-BR':'AccuQuilt',  'ja':'AccuQuilt',  'ko':'AccuQuilt','zh-CN':'AccuQuilt' },
  stash_feet:        { 'en-US':'Feet',           'en-GB':'Feet',        'de':'Nähfüße',     'fr':'Pieds',      'nl':'Voetjes',     'es':'Prensatelas', 'pt-BR':'Calcadores', 'ja':'押さえ',     'ko':'노루발',   'zh-CN':'压脚'   },
  stash_accessories: { 'en-US':'Accessories',    'en-GB':'Accessories', 'de':'Zubehör',     'fr':'Accessoires','nl':'Accessoires', 'es':'Accesorios',  'pt-BR':'Acessórios', 'ja':'アクセサリー','ko':'액세서리', 'zh-CN':'配件'   },
  stash_empty:       { 'en-US':'Nothing here yet.','en-GB':'Nothing here yet.','de':'Noch nichts vorhanden.','fr':'Rien ici pour l\'instant.','nl':'Nog niets hier.','es':'Nada aquí todavía.','pt-BR':'Nada aqui ainda.','ja':'まだ何もありません。','ko':'아직 아무것도 없습니다.','zh-CN':'这里还没有任何东西。' },
  stash_items:       { 'en-US':'items',          'en-GB':'items',       'de':'Artikel',     'fr':'articles',   'nl':'items',       'es':'artículos',   'pt-BR':'itens',      'ja':'点',         'ko':'개',       'zh-CN':'件'     },
  stash_spools:      { 'en-US':'spools',         'en-GB':'spools',      'de':'Spulen',      'fr':'bobines',    'nl':'spoelen',     'es':'bobinas',     'pt-BR':'carretéis',  'ja':'スプール',   'ko':'스풀',     'zh-CN':'线轴'   },
  stash_spool:       { 'en-US':'spool',          'en-GB':'spool',       'de':'Spule',       'fr':'bobine',     'nl':'spoel',       'es':'bobina',      'pt-BR':'carretel',   'ja':'スプール',   'ko':'스풀',     'zh-CN':'线轴'   },

  // ── Accessories ───────────────────────────────────────────
  acc_add:           { 'en-US':'Add accessory',  'en-GB':'Add accessory','de':'Zubehör hinzufügen','fr':'Ajouter un accessoire','nl':'Accessoire toevoegen','es':'Agregar accesorio','pt-BR':'Adicionar acessório','ja':'アクセサリーを追加','ko':'액세서리 추가','zh-CN':'添加配件' },
  acc_name:          { 'en-US':'Item name',      'en-GB':'Item name',   'de':'Artikelname', 'fr':'Nom de l\'article', 'nl':'Itemnaam', 'es':'Nombre del artículo', 'pt-BR':'Nome do item', 'ja':'アイテム名', 'ko':'항목 이름', 'zh-CN':'物品名称' },
  acc_qty:           { 'en-US':'Quantity',       'en-GB':'Quantity',    'de':'Menge',       'fr':'Quantité',   'nl':'Aantal',      'es':'Cantidad',    'pt-BR':'Quantidade',  'ja':'数量',       'ko':'수량',     'zh-CN':'数量'   },
  acc_notes:         { 'en-US':'Notes',          'en-GB':'Notes',       'de':'Notizen',     'fr':'Notes',      'nl':'Notities',    'es':'Notas',       'pt-BR':'Notas',       'ja':'メモ',       'ko':'메모',     'zh-CN':'备注'   },
  acc_placeholder:   { 'en-US':'e.g. Seam ripper, bobbins, needles, glue pen…', 'en-GB':'e.g. Seam ripper, bobbins, needles, glue pen…', 'de':'z.B. Nahttrenner, Spulen, Nadeln…', 'fr':'ex. Découd-vite, bobines, aiguilles…', 'nl':'bijv. Naadopener, spoelen, naalden…', 'es':'ej. Descosedor, bobinas, agujas…', 'pt-BR':'ex. Descosturador, bobinas, agulhas…', 'ja':'例：リッパー、ボビン、針…', 'ko':'예: 실뜯개, 보빈, 바늘…', 'zh-CN':'例如：拆线器、梭芯、针…' },

  // ── Projects ──────────────────────────────────────────────
  projects_title:    { 'en-US':'Projects',       'en-GB':'Projects',    'de':'Projekte',    'fr':'Projets',    'nl':'Projecten',   'es':'Proyectos',   'pt-BR':'Projetos',   'ja':'プロジェクト','ko':'프로젝트', 'zh-CN':'项目'   },
  projects_new:      { 'en-US':'+ New Project',  'en-GB':'+ New Project','de':'+ Neues Projekt','fr':'+ Nouveau projet','nl':'+ Nieuw project','es':'+ Nuevo proyecto','pt-BR':'+ Novo projeto','ja':'+ 新しいプロジェクト','ko':'+ 새 프로젝트','zh-CN':'+ 新项目' },
  projects_name:     { 'en-US':'Project name',   'en-GB':'Project name','de':'Projektname', 'fr':'Nom du projet','nl':'Projectnaam', 'es':'Nombre del proyecto','pt-BR':'Nome do projeto','ja':'プロジェクト名','ko':'프로젝트 이름','zh-CN':'项目名称' },
  projects_status:   { 'en-US':'Status',         'en-GB':'Status',      'de':'Status',      'fr':'Statut',     'nl':'Status',      'es':'Estado',      'pt-BR':'Status',     'ja':'ステータス', 'ko':'상태',     'zh-CN':'状态'   },
  projects_planning: { 'en-US':'Planning',       'en-GB':'Planning',    'de':'Planung',     'fr':'Planification','nl':'Planning',  'es':'Planificando','pt-BR':'Planejando', 'ja':'計画中',     'ko':'계획 중',  'zh-CN':'规划中' },
  projects_progress: { 'en-US':'In Progress',    'en-GB':'In Progress', 'de':'In Bearbeitung','fr':'En cours', 'nl':'In uitvoering','es':'En progreso', 'pt-BR':'Em andamento','ja':'進行中',    'ko':'진행 중',  'zh-CN':'进行中' },
  projects_hold:     { 'en-US':'On Hold',        'en-GB':'On Hold',     'de':'Pausiert',    'fr':'En pause',   'nl':'On hold',     'es':'En pausa',    'pt-BR':'Em pausa',   'ja':'保留中',     'ko':'보류 중',  'zh-CN':'暂停'   },
  projects_complete: { 'en-US':'Complete',       'en-GB':'Complete',    'de':'Abgeschlossen','fr':'Terminé',   'nl':'Voltooid',    'es':'Completado',  'pt-BR':'Concluído',  'ja':'完了',       'ko':'완료',     'zh-CN':'完成'   },
  projects_create:   { 'en-US':'Create Project', 'en-GB':'Create Project','de':'Projekt erstellen','fr':'Créer le projet','nl':'Project aanmaken','es':'Crear proyecto','pt-BR':'Criar projeto','ja':'プロジェクトを作成','ko':'프로젝트 만들기','zh-CN':'创建项目' },
  projects_req:      { 'en-US':'Required Threads','en-GB':'Required Threads','de':'Benötigte Fäden','fr':'Fils requis','nl':'Benodigde draden','es':'Hilos requeridos','pt-BR':'Linhas necessárias','ja':'必要な糸','ko':'필요한 실','zh-CN':'所需线材' },
  projects_empty:    { 'en-US':'No threads added yet.','en-GB':'No threads added yet.','de':'Noch keine Fäden hinzugefügt.','fr':'Aucun fil ajouté pour l\'instant.','nl':'Nog geen draden toegevoegd.','es':'Aún no hay hilos añadidos.','pt-BR':'Nenhuma linha adicionada ainda.','ja':'まだ糸が追加されていません。','ko':'아직 추가된 실이 없습니다.','zh-CN':'尚未添加线材。' },

  // ── General UI ────────────────────────────────────────────
  btn_save:          { 'en-US':'Save',           'en-GB':'Save',        'de':'Speichern',   'fr':'Enregistrer','nl':'Opslaan',     'es':'Guardar',     'pt-BR':'Salvar',     'ja':'保存',       'ko':'저장',     'zh-CN':'保存'   },
  btn_cancel:        { 'en-US':'Cancel',         'en-GB':'Cancel',      'de':'Abbrechen',   'fr':'Annuler',    'nl':'Annuleren',   'es':'Cancelar',    'pt-BR':'Cancelar',   'ja':'キャンセル', 'ko':'취소',     'zh-CN':'取消'   },
  btn_remove:        { 'en-US':'Remove',         'en-GB':'Remove',      'de':'Entfernen',   'fr':'Supprimer',  'nl':'Verwijderen', 'es':'Eliminar',    'pt-BR':'Remover',    'ja':'削除',       'ko':'삭제',     'zh-CN':'删除'   },
  btn_add:           { 'en-US':'+ Add',          'en-GB':'+ Add',       'de':'+ Hinzufügen','fr':'+ Ajouter',  'nl':'+ Toevoegen', 'es':'+ Agregar',   'pt-BR':'+ Adicionar','ja':'+ 追加',     'ko':'+ 추가',   'zh-CN':'+ 添加' },
  btn_owned:         { 'en-US':'✓ Owned',        'en-GB':'✓ Owned',     'de':'✓ Vorhanden', 'fr':'✓ Possédé',  'nl':'✓ In bezit',  'es':'✓ Tengo',     'pt-BR':'✓ Tenho',    'ja':'✓ 所有',     'ko':'✓ 보유',   'zh-CN':'✓ 已拥有' },
  btn_dismiss:       { 'en-US':'Dismiss',        'en-GB':'Dismiss',     'de':'Schließen',   'fr':'Ignorer',    'nl':'Sluiten',     'es':'Cerrar',      'pt-BR':'Fechar',     'ja':'閉じる',     'ko':'닫기',     'zh-CN':'关闭'   },
  lbl_search:        { 'en-US':'Search…',        'en-GB':'Search…',     'de':'Suchen…',     'fr':'Rechercher…','nl':'Zoeken…',     'es':'Buscar…',     'pt-BR':'Buscar…',    'ja':'検索…',      'ko':'검색…',    'zh-CN':'搜索…'  },
  lbl_barcode:       { 'en-US':'Barcode',        'en-GB':'Barcode',     'de':'Barcode',     'fr':'Code-barres','nl':'Barcode',     'es':'Código de barras','pt-BR':'Código de barras','ja':'バーコード','ko':'바코드','zh-CN':'条形码' },
  lbl_weight:        { 'en-US':'Weight',         'en-GB':'Weight',      'de':'Gewicht',     'fr':'Poids',      'nl':'Gewicht',     'es':'Peso',        'pt-BR':'Peso',       'ja':'重さ',       'ko':'무게',     'zh-CN':'规格'   },
  lbl_spools:        { 'en-US':'Spools on hand', 'en-GB':'Spools on hand','de':'Vorhandene Spulen','fr':'Bobines disponibles','nl':'Beschikbare spoelen','es':'Bobinas disponibles','pt-BR':'Carretéis disponíveis','ja':'手元のスプール数','ko':'보유 스풀 수','zh-CN':'现有线轴数' },
  lbl_target:        { 'en-US':'Inventory target','en-GB':'Inventory target','de':'Zielmenge','fr':'Objectif de stock','nl':'Voorraaddoel','es':'Objetivo de inventario','pt-BR':'Meta de estoque','ja':'在庫目標','ko':'재고 목표','zh-CN':'库存目标' },
  lbl_spool_size:    { 'en-US':'Spool size',     'en-GB':'Spool size',  'de':'Spulengröße', 'fr':'Taille de bobine','nl':'Spoelgrootte','es':'Tamaño de bobina','pt-BR':'Tamanho do carretel','ja':'スプールサイズ','ko':'스풀 크기','zh-CN':'线轴规格' },
  lbl_color_swatch:  { 'en-US':'Color swatch',  'en-GB':'Colour swatch','de':'Farbmuster',  'fr':'Échantillon de couleur','nl':'Kleurstaaltje','es':'Muestra de color','pt-BR':'Amostra de cor','ja':'カラーサンプル','ko':'색상 샘플','zh-CN':'颜色样本' },
  lbl_thread_name:   { 'en-US':'Thread name',   'en-GB':'Thread name', 'de':'Fadenname',   'fr':'Nom du fil', 'nl':'Draadnaam',   'es':'Nombre del hilo','pt-BR':'Nome da linha','ja':'糸の名前','ko':'실 이름','zh-CN':'线材名称' },
  lbl_color_family:  { 'en-US':'Color family',  'en-GB':'Colour family','de':'Farbfamilie', 'fr':'Famille de couleur','nl':'Kleurfamilie','es':'Familia de colores','pt-BR':'Família de cores','ja':'カラーファミリー','ko':'색상 계열','zh-CN':'颜色系列' },

  // ── Settings ──────────────────────────────────────────────
  settings_title:    { 'en-US':'Settings',       'en-GB':'Settings',    'de':'Einstellungen','fr':'Paramètres', 'nl':'Instellingen','es':'Configuración','pt-BR':'Configurações','ja':'設定',      'ko':'설정',     'zh-CN':'设置'   },
  settings_language: { 'en-US':'Language',       'en-GB':'Language',    'de':'Sprache',     'fr':'Langue',     'nl':'Taal',        'es':'Idioma',      'pt-BR':'Idioma',     'ja':'言語',       'ko':'언어',     'zh-CN':'语言'   },
  settings_language_note:{ 'en-US':'UI language. Thread color names remain in their original language.', 'en-GB':'UI language. Thread colour names remain in their original language.', 'de':'UI-Sprache. Farbennamen bleiben in der Originalsprache.', 'fr':'Langue de l\'interface. Les noms de couleurs restent dans leur langue d\'origine.', 'nl':'Interfacetaal. Kleurnamen blijven in hun originele taal.', 'es':'Idioma de la interfaz. Los nombres de colores permanecen en su idioma original.', 'pt-BR':'Idioma da interface. Os nomes das cores permanecem no idioma original.', 'ja':'UIの言語。糸の色名は元の言語のままです。', 'ko':'UI 언어. 실 색상 이름은 원래 언어로 유지됩니다.', 'zh-CN':'界面语言。线材颜色名称保持原始语言。' },
  settings_show_barcodes:{ 'en-US':'Show barcodes','en-GB':'Show barcodes','de':'Barcodes anzeigen','fr':'Afficher les codes-barres','nl':'Barcodes weergeven','es':'Mostrar códigos de barras','pt-BR':'Mostrar códigos de barras','ja':'バーコードを表示','ko':'바코드 표시','zh-CN':'显示条形码' },
  settings_show_weights:{ 'en-US':'Show thread weights','en-GB':'Show thread weights','de':'Fadengewichte anzeigen','fr':'Afficher les grammages','nl':'Draadgewichten weergeven','es':'Mostrar pesos de hilo','pt-BR':'Mostrar pesos de linha','ja':'糸の太さを表示','ko':'실 굵기 표시','zh-CN':'显示线材规格' },
  settings_auto_shop:{ 'en-US':'Auto-add zero inventory to shopping list','en-GB':'Auto-add zero inventory to shopping list','de':'Nullbestand automatisch zur Einkaufsliste hinzufügen','fr':'Ajouter auto. le stock nul à la liste de courses','nl':'Nulvoorraad automatisch aan boodschappenlijst toevoegen','es':'Agregar automáticamente inventario cero a la lista de compras','pt-BR':'Adicionar automaticamente estoque zero à lista de compras','ja':'在庫ゼロを自動的に買い物リストに追加','ko':'재고 0 항목 자동으로 쇼핑 목록에 추가','zh-CN':'自动将零库存添加到购物清单' },
  settings_default_match:{ 'en-US':'Default match mode','en-GB':'Default match mode','de':'Standard-Suchmodus','fr':'Mode de recherche par défaut','nl':'Standaard zoekmodus','es':'Modo de búsqueda predeterminado','pt-BR':'Modo de pesquisa padrão','ja':'デフォルト検索モード','ko':'기본 검색 모드','zh-CN':'默认搜索模式' },
  settings_check_updates:{ 'en-US':'Check for Updates','en-GB':'Check for Updates','de':'Updates suchen','fr':'Vérifier les mises à jour','nl':'Updates controleren','es':'Buscar actualizaciones','pt-BR':'Verificar atualizações','ja':'更新を確認','ko':'업데이트 확인','zh-CN':'检查更新' },
  settings_sync:     { 'en-US':'Run Auto-Sync',  'en-GB':'Run Auto-Sync','de':'Auto-Sync ausführen','fr':'Lancer la synchronisation','nl':'Auto-sync uitvoeren','es':'Ejecutar sincronización','pt-BR':'Executar sincronização','ja':'自動同期を実行','ko':'자동 동기화 실행','zh-CN':'运行自动同步' },
  settings_app_version:{ 'en-US':'App Version',  'en-GB':'App Version', 'de':'App-Version', 'fr':'Version de l\'app','nl':'App-versie',  'es':'Versión de la app','pt-BR':'Versão do app','ja':'アプリバージョン','ko':'앱 버전','zh-CN':'应用版本' },
  settings_lib_version:{ 'en-US':'Library Version','en-GB':'Library Version','de':'Bibliotheksversion','fr':'Version de la bibliothèque','nl':'Bibliotheekversie','es':'Versión de biblioteca','pt-BR':'Versão da biblioteca','ja':'ライブラリバージョン','ko':'라이브러리 버전','zh-CN':'库版本' },
  settings_last_synced:{ 'en-US':'Last Synced','en-GB':'Last Synced','de':'Zuletzt synchronisiert','fr':'Dernière synchronisation','nl':'Laatste synchronisatie','es':'Última sincronización','pt-BR':'Última sincronização','ja':'最終同期','ko':'마지막 동기화','zh-CN':'上次同步' },
  settings_status:   { 'en-US':'Status',         'en-GB':'Status',      'de':'Status',      'fr':'Statut',     'nl':'Status',      'es':'Estado',      'pt-BR':'Status',     'ja':'ステータス', 'ko':'상태',     'zh-CN':'状态'   },
  settings_connected:{ 'en-US':'Database: Connected ✓','en-GB':'Database: Connected ✓','de':'Datenbank: Verbunden ✓','fr':'Base de données : Connectée ✓','nl':'Database: Verbonden ✓','es':'Base de datos: Conectada ✓','pt-BR':'Banco de dados: Conectado ✓','ja':'データベース：接続済み ✓','ko':'데이터베이스: 연결됨 ✓','zh-CN':'数据库：已连接 ✓' },

  // ── Help ──────────────────────────────────────────────────
  help_title:        { 'en-US':'Help',           'en-GB':'Help',        'de':'Hilfe',       'fr':'Aide',       'nl':'Help',        'es':'Ayuda',       'pt-BR':'Ajuda',      'ja':'ヘルプ',     'ko':'도움말',   'zh-CN':'帮助'   },

  // ── Machines / AccuQuilt / Feet ───────────────────────────
  browse_machines:   { 'en-US':'Machine Library','en-GB':'Machine Library','de':'Maschinenverzeichnis','fr':'Bibliothèque de machines','nl':'Machinebibliotheek','es':'Biblioteca de máquinas','pt-BR':'Biblioteca de máquinas','ja':'ミシンライブラリ','ko':'재봉틀 라이브러리','zh-CN':'机器库' },
  browse_accuquilt:  { 'en-US':'AccuQuilt Cutters & Dies','en-GB':'AccuQuilt Cutters & Dies','de':'AccuQuilt-Schneidewerkzeuge','fr':'Couteaux et matrices AccuQuilt','nl':'AccuQuilt-snijders & mallen','es':'Cortadores y troqueles AccuQuilt','pt-BR':'Cortadores e matrizes AccuQuilt','ja':'AccuQuilt カッター＆ダイ','ko':'AccuQuilt 커터 및 다이','zh-CN':'AccuQuilt 裁剪工具' },
  browse_feet:       { 'en-US':'Presser Feet Library','en-GB':'Presser Feet Library','de':'Nähfüße-Bibliothek','fr':'Bibliothèque de pieds','nl':'Naaivoetjesbibliotheek','es':'Biblioteca de prensatelas','pt-BR':'Biblioteca de calcadores','ja':'押さえライブラリ','ko':'노루발 라이브러리','zh-CN':'压脚库' },
  browse_rulers:     { 'en-US':'Ruler Library',  'en-GB':'Ruler Library','de':'Linealverzeichnis','fr':'Bibliothèque de règles','nl':'Lineaalbibliotheek','es':'Biblioteca de reglas','pt-BR':'Biblioteca de réguas','ja':'定規ライブラリ','ko':'자 라이브러리','zh-CN':'尺子库' },
  owned:             { 'en-US':'✓ Owned',        'en-GB':'✓ Owned',     'de':'✓ Vorhanden', 'fr':'✓ Possédé',  'nl':'✓ In bezit',  'es':'✓ Tengo',     'pt-BR':'✓ Tenho',    'ja':'✓ 所有中',   'ko':'✓ 보유',   'zh-CN':'✓ 已拥有' },
  throat:            { 'en-US':'throat',         'en-GB':'throat',      'de':'Arm',         'fr':'bras libre',  'nl':'arm',        'es':'espacio libre','pt-BR':'espaço livre','ja':'アーム',    'ko':'암',       'zh-CN':'臂距'   },

  // ── Sewing machine categories ─────────────────────────────
  type_sewing:       { 'en-US':'Sewing',         'en-GB':'Sewing',      'de':'Nähen',       'fr':'Couture',    'nl':'Naaien',      'es':'Costura',     'pt-BR':'Costura',    'ja':'ソーイング', 'ko':'재봉',     'zh-CN':'缝纫'   },
  type_quilting:     { 'en-US':'Quilting',        'en-GB':'Quilting',    'de':'Quilten',     'fr':'Quilting',   'nl':'Quilten',     'es':'Acolchado',   'pt-BR':'Acolchoado', 'ja':'キルティング','ko':'퀼팅',    'zh-CN':'绗缝'   },
  type_embroidery:   { 'en-US':'Embroidery',      'en-GB':'Embroidery',  'de':'Stickerei',   'fr':'Broderie',   'nl':'Borduurwerk', 'es':'Bordado',     'pt-BR':'Bordado',    'ja':'刺繍',       'ko':'자수',     'zh-CN':'刺绣'   },
  type_longarm:      { 'en-US':'Longarm',         'en-GB':'Longarm',     'de':'Longarm',     'fr':'Longarm',    'nl':'Longarm',     'es':'Longarm',     'pt-BR':'Longarm',    'ja':'ロングアーム','ko':'롱암',    'zh-CN':'长臂机' },
  type_serger:       { 'en-US':'Serger',          'en-GB':'Overlocker',  'de':'Overlock',    'fr':'Surjeteuse', 'nl':'Overlocker',  'es':'Remalladora', 'pt-BR':'Overlock',   'ja':'ロックミシン','ko':'오버록',  'zh-CN':'锁边机' },
  type_vintage:      { 'en-US':'Vintage',         'en-GB':'Vintage',     'de':'Vintage',     'fr':'Vintage',    'nl':'Vintage',     'es':'Vintage',     'pt-BR':'Vintage',    'ja':'ヴィンテージ','ko':'빈티지',  'zh-CN':'复古'   },

  // ── Feet categories ───────────────────────────────────────
  foot_quilting:     { 'en-US':'Quilting',        'en-GB':'Quilting',    'de':'Quilten',     'fr':'Quilting',   'nl':'Quilten',     'es':'Acolchado',   'pt-BR':'Acolchoado', 'ja':'キルティング','ko':'퀼팅',    'zh-CN':'绗缝'   },
  foot_garment:      { 'en-US':'Garment',         'en-GB':'Garment',     'de':'Kleidung',    'fr':'Vêtement',   'nl':'Kleding',     'es':'Ropa',        'pt-BR':'Vestuário',  'ja':'ガーメント', 'ko':'의류',     'zh-CN':'服装'   },
  foot_specialty:    { 'en-US':'Specialty',       'en-GB':'Specialty',   'de':'Spezial',     'fr':'Spécialité', 'nl':'Speciaal',    'es':'Especialidad','pt-BR':'Especialidade','ja':'スペシャリティ','ko':'특수','zh-CN':'特殊'   },
  foot_serging:      { 'en-US':'Serging',         'en-GB':'Overlocking', 'de':'Overlocking', 'fr':'Surjet',     'nl':'Overlocking', 'es':'Remallado',   'pt-BR':'Overloque',  'ja':'ロック',     'ko':'오버록',   'zh-CN':'包缝'   },
  foot_general:      { 'en-US':'General',         'en-GB':'General',     'de':'Allgemein',   'fr':'Général',    'nl':'Algemeen',    'es':'General',     'pt-BR':'Geral',      'ja':'一般',       'ko':'일반',     'zh-CN':'通用'   },

  // ── Color families ────────────────────────────────────────
  cf_all:            { 'en-US':'All',             'en-GB':'All',         'de':'Alle',        'fr':'Tous',       'nl':'Alle',        'es':'Todos',       'pt-BR':'Todos',      'ja':'すべて',     'ko':'전체',     'zh-CN':'全部'   },
  cf_whites:         { 'en-US':'Whites & Creams', 'en-GB':'Whites & Creams','de':'Weiß & Creme','fr':'Blancs & crèmes','nl':'Wit & crème','es':'Blancos y cremas','pt-BR':'Brancos e cremes','ja':'白・クリーム系','ko':'흰색·크림 계열','zh-CN':'白色系' },
  cf_yellows:        { 'en-US':'Yellows & Golds', 'en-GB':'Yellows & Golds','de':'Gelb & Gold','fr':'Jaunes & ors','nl':'Geel & goud','es':'Amarillos y dorados','pt-BR':'Amarelos e dourados','ja':'黄色・ゴールド系','ko':'노란색·금색 계열','zh-CN':'黄色系' },
  cf_oranges:        { 'en-US':'Oranges',         'en-GB':'Oranges',     'de':'Orange',      'fr':'Oranges',    'nl':'Oranje',      'es':'Naranjas',    'pt-BR':'Laranjas',   'ja':'オレンジ系', 'ko':'주황색 계열','zh-CN':'橙色系' },
  cf_reds:           { 'en-US':'Reds',            'en-GB':'Reds',        'de':'Rot',         'fr':'Rouges',     'nl':'Rood',        'es':'Rojos',       'pt-BR':'Vermelhos',  'ja':'赤系',       'ko':'빨간색 계열','zh-CN':'红色系' },
  cf_pinks:          { 'en-US':'Pinks & Magentas','en-GB':'Pinks & Magentas','de':'Rosa & Magenta','fr':'Roses & magentas','nl':'Roze & magenta','es':'Rosas y magentas','pt-BR':'Rosas e magentas','ja':'ピンク・マゼンタ系','ko':'분홍색·자홍색 계열','zh-CN':'粉红色系' },
  cf_purples:        { 'en-US':'Purples & Lavenders','en-GB':'Purples & Lavenders','de':'Lila & Lavendel','fr':'Violets & lavandes','nl':'Paars & lavendel','es':'Morados y lavandas','pt-BR':'Roxos e lavandas','ja':'紫・ラベンダー系','ko':'보라색·라벤더 계열','zh-CN':'紫色系' },
  cf_blues:          { 'en-US':'Blues',           'en-GB':'Blues',       'de':'Blau',        'fr':'Bleus',      'nl':'Blauw',       'es':'Azules',      'pt-BR':'Azuis',      'ja':'青系',       'ko':'파란색 계열','zh-CN':'蓝色系' },
  cf_teals:          { 'en-US':'Teals & Aquas',   'en-GB':'Teals & Aquas','de':'Türkis & Aqua','fr':'Teals & aquas','nl':'Teal & aqua','es':'Verdes azulados','pt-BR':'Teais e aquas','ja':'ティール・アクア系','ko':'청록색·아쿠아 계열','zh-CN':'青绿色系' },
  cf_greens:         { 'en-US':'Greens',          'en-GB':'Greens',      'de':'Grün',        'fr':'Verts',      'nl':'Groen',       'es':'Verdes',      'pt-BR':'Verdes',     'ja':'緑系',       'ko':'초록색 계열','zh-CN':'绿色系' },
  cf_browns:         { 'en-US':'Browns & Tans',   'en-GB':'Browns & Tans','de':'Braun & Beige','fr':'Bruns et beiges','nl':'Bruin & beige','es':'Marrones y beiges','pt-BR':'Marrons e bege','ja':'茶色・タン系','ko':'갈색·베이지 계열','zh-CN':'棕色系' },
  cf_greys:          { 'en-US':'Greys & Blacks',  'en-GB':'Greys & Blacks','de':'Grau & Schwarz','fr':'Gris et noirs','nl':'Grijs & zwart','es':'Grises y negros','pt-BR':'Cinzas e pretos','ja':'グレー・ブラック系','ko':'회색·검정 계열','zh-CN':'灰色系' },
  cf_specialty:      { 'en-US':'Specialty & Variegated','en-GB':'Specialty & Variegated','de':'Spezial & Meliert','fr':'Spécial & variegated','nl':'Speciaal & gevlekt','es':'Especiales y variegados','pt-BR':'Especiais e variegados','ja':'スペシャル・段染め系','ko':'특수·멀티 컬러 계열','zh-CN':'特殊色系' },

  // ── Shopping list ─────────────────────────────────────────
  shop_empty:        { 'en-US':'Your shopping list is empty.','en-GB':'Your shopping list is empty.','de':'Ihre Einkaufsliste ist leer.','fr':'Votre liste de courses est vide.','nl':'Uw boodschappenlijst is leeg.','es':'Su lista de compras está vacía.','pt-BR':'Sua lista de compras está vazia.','ja':'買い物リストは空です。','ko':'쇼핑 목록이 비어 있습니다.','zh-CN':'购物清单为空。' },
  shop_qty:          { 'en-US':'Qty',            'en-GB':'Qty',         'de':'Menge',       'fr':'Qté',        'nl':'Aantal',      'es':'Cant.',       'pt-BR':'Qtd.',       'ja':'数量',       'ko':'수량',     'zh-CN':'数量'   },
  // ── Stash (i18n pass 1) ──────────────────────────────────
  stash_loading: { 'en-US':'Loading your stash…', 'en-GB':'Loading your stash…', 'de':'Lade deinen Vorrat…', 'fr':'Chargement de votre stash…', 'nl':'Je voorraad laden…', 'es':'Cargando tu inventario…', 'pt-BR':'Carregando seu estoque…', 'ja':'在庫を読み込み中…', 'ko':'재고를 불러오는 중…', 'zh-CN':'正在加载您的库存…' },
  stash_fabrics: { 'en-US':'Fabrics', 'en-GB':'Fabrics', 'de':'Stoffe', 'fr':'Tissus', 'nl':'Stoffen', 'es':'Telas', 'pt-BR':'Tecidos', 'ja':'生地', 'ko':'원단', 'zh-CN':'布料' },
  stash_shopping: { 'en-US':'Shopping', 'en-GB':'Shopping', 'de':'Einkauf', 'fr':'Achats', 'nl':'Winkelen', 'es':'Compras', 'pt-BR':'Compras', 'ja':'買い物', 'ko':'쇼핑', 'zh-CN':'购物' },
  stash_insurance: { 'en-US':'Insurance Report', 'en-GB':'Insurance Report', 'de':'Versicherungsbericht', 'fr':'Rapport d\'assurance', 'nl':'Verzekeringsrapport', 'es':'Informe de seguro', 'pt-BR':'Relatório de seguro', 'ja':'保険レポート', 'ko':'보험 보고서', 'zh-CN':'保险报告' },
  stash_low: { 'en-US':'Low', 'en-GB':'Low', 'de':'Niedrig', 'fr':'Bas', 'nl':'Laag', 'es':'Bajo', 'pt-BR':'Baixo', 'ja':'残少', 'ko':'부족', 'zh-CN':'不足' },
  stash_target_short: { 'en-US':'Target', 'en-GB':'Target', 'de':'Ziel', 'fr':'Objectif', 'nl':'Doel', 'es':'Objetivo', 'pt-BR':'Meta', 'ja':'目標', 'ko':'목표', 'zh-CN':'目标' },
  stash_add_shopping: { 'en-US':'+ Shopping List', 'en-GB':'+ Shopping List', 'de':'+ Einkaufsliste', 'fr':'+ Liste de courses', 'nl':'+ Boodschappenlijst', 'es':'+ Lista de compras', 'pt-BR':'+ Lista de compras', 'ja':'+ 買い物リスト', 'ko':'+ 쇼핑 목록', 'zh-CN':'+ 购物清单' },
  stash_harmony: { 'en-US':'Color Harmony', 'en-GB':'Colour Harmony', 'de':'Farbharmonie', 'fr':'Harmonie des couleurs', 'nl':'Kleurharmonie', 'es':'Armonía de color', 'pt-BR':'Harmonia de cores', 'ja':'カラーハーモニー', 'ko':'색상 조화', 'zh-CN':'配色' },
  stash_limit_reached: { 'en-US':'Stash limit reached.', 'en-GB':'Stash limit reached.', 'de':'Vorratslimit erreicht.', 'fr':'Limite de stash atteinte.', 'nl':'Voorraadlimiet bereikt.', 'es':'Límite de inventario alcanzado.', 'pt-BR':'Limite do estoque atingido.', 'ja':'在庫の上限に達しました。', 'ko':'재고 한도에 도달했습니다.', 'zh-CN':'已达到库存上限。' },
  stash_limit_detail: { 'en-US':'Free accounts can store up to {n} threads.', 'en-GB':'Free accounts can store up to {n} threads.', 'de':'Kostenlose Konten können bis zu {n} Fäden speichern.', 'fr':'Les comptes gratuits peuvent stocker jusqu\'à {n} fils.', 'nl':'Gratis accounts kunnen tot {n} draden opslaan.', 'es':'Las cuentas gratuitas pueden guardar hasta {n} hilos.', 'pt-BR':'Contas gratuitas podem armazenar até {n} linhas.', 'ja':'無料アカウントは最大{n}個の糸を保存できます。', 'ko':'무료 계정은 최대 {n}개의 실을 저장할 수 있습니다.', 'zh-CN':'免费账户最多可存储 {n} 种线材。' },
  stash_upgrade_basic: { 'en-US':'Upgrade to Basic', 'en-GB':'Upgrade to Basic', 'de':'Auf Basic upgraden', 'fr':'Passer à Basic', 'nl':'Upgrade naar Basic', 'es':'Mejorar a Basic', 'pt-BR':'Atualizar para Basic', 'ja':'Basicにアップグレード', 'ko':'Basic으로 업그레이드', 'zh-CN':'升级到 Basic' },
  stash_upgrade_unlim: { 'en-US':'for unlimited.', 'en-GB':'for unlimited.', 'de':'für unbegrenzt.', 'fr':'pour un accès illimité.', 'nl':'voor onbeperkt.', 'es':'para ilimitado.', 'pt-BR':'para ilimitado.', 'ja':'で無制限に。', 'ko':'무제한 이용.', 'zh-CN':'即可无限存储。' },
  stash_threads_empty: { 'en-US':'No threads yet — use the Match tab to find and add threads.', 'en-GB':'No threads yet — use the Match tab to find and add threads.', 'de':'Noch keine Fäden – nutze den Suche-Tab, um Fäden zu finden und hinzuzufügen.', 'fr':'Aucun fil pour l\'instant — utilisez l\'onglet Chercher pour trouver et ajouter des fils.', 'nl':'Nog geen draden — gebruik het tabblad Zoeken om draden te vinden en toe te voegen.', 'es':'Aún no hay hilos — usa la pestaña Buscar para encontrar y agregar hilos.', 'pt-BR':'Ainda não há linhas — use a aba Buscar para encontrar e adicionar linhas.', 'ja':'まだ糸がありません — 「検索」タブで糸を探して追加してください。', 'ko':'아직 실이 없습니다 — \'검색\' 탭에서 실을 찾아 추가하세요.', 'zh-CN':'还没有线材 — 使用“查找”标签来查找并添加线材。' },
  stash_acct_title: { 'en-US':'Your Stash Requires an Account', 'en-GB':'Your Stash Requires an Account', 'de':'Dein Vorrat erfordert ein Konto', 'fr':'Votre stash nécessite un compte', 'nl':'Je voorraad vereist een account', 'es':'Tu inventario requiere una cuenta', 'pt-BR':'Seu estoque requer uma conta', 'ja':'在庫の利用にはアカウントが必要です', 'ko':'재고를 사용하려면 계정이 필요합니다', 'zh-CN':'您的库存需要一个账户' },
  stash_acct_body: { 'en-US':'Sign in to track your threads, machines, rulers, presser feet, and accessories.', 'en-GB':'Sign in to track your threads, machines, rulers, presser feet, and accessories.', 'de':'Melde dich an, um Fäden, Maschinen, Lineale, Nähfüße und Zubehör zu verwalten.', 'fr':'Connectez-vous pour suivre vos fils, machines, règles, pieds-de-biche et accessoires.', 'nl':'Meld je aan om je draden, machines, linialen, persvoeten en accessoires bij te houden.', 'es':'Inicia sesión para registrar tus hilos, máquinas, reglas, prensatelas y accesorios.', 'pt-BR':'Entre para acompanhar suas linhas, máquinas, réguas, calcadores e acessórios.', 'ja':'サインインして、糸・ミシン・定規・押さえ金・付属品を管理しましょう。', 'ko':'로그인하여 실, 재봉틀, 자, 노루발, 액세서리를 관리하세요.', 'zh-CN':'登录以管理您的线材、缝纫机、尺子、压脚和配件。' },
  stash_signin: { 'en-US':'Sign In / Create Account', 'en-GB':'Sign In / Create Account', 'de':'Anmelden / Konto erstellen', 'fr':'Se connecter / Créer un compte', 'nl':'Aanmelden / Account aanmaken', 'es':'Iniciar sesión / Crear cuenta', 'pt-BR':'Entrar / Criar conta', 'ja':'サインイン / アカウント作成', 'ko':'로그인 / 계정 만들기', 'zh-CN':'登录 / 创建账户' },
  // ── Field Guide chrome (i18n pass 2) ──
  fg_title: { 'en-US':'Quilter\'s Field Guide', 'en-GB':'Quilter\'s Field Guide', 'de':'Quilt-Handbuch', 'fr':'Guide pratique du quilteur', 'nl':'Quilters veldgids', 'es':'Guía de la Quilter', 'pt-BR':'Guia da Quilter', 'ja':'キルター・フィールドガイド', 'ko':'퀼터 필드 가이드', 'zh-CN':'拼布者实用指南' },
  fg_subtitle: { 'en-US':'Know your tools & materials', 'en-GB':'Know your tools & materials', 'de':'Kenne deine Werkzeuge & Materialien', 'fr':'Connaissez vos outils et matériaux', 'nl':'Ken je gereedschap & materialen', 'es':'Conoce tus herramientas y materiales', 'pt-BR':'Conheça suas ferramentas e materiais', 'ja':'道具と材料を知る', 'ko':'도구와 재료 알기', 'zh-CN':'了解你的工具和材料' },
  fg_close: { 'en-US':'Close', 'en-GB':'Close', 'de':'Schließen', 'fr':'Fermer', 'nl':'Sluiten', 'es':'Cerrar', 'pt-BR':'Fechar', 'ja':'閉じる', 'ko':'닫기', 'zh-CN':'关闭' },
  fg_loading: { 'en-US':'Opening your field guide…', 'en-GB':'Opening your field guide…', 'de':'Handbuch wird geöffnet…', 'fr':'Ouverture du guide…', 'nl':'Veldgids openen…', 'es':'Abriendo tu guía…', 'pt-BR':'Abrindo seu guia…', 'ja':'ガイドを開いています…', 'ko':'가이드를 여는 중…', 'zh-CN':'正在打开指南…' },
  fg_denied_title: { 'en-US':'The Field Guide is a Basic feature', 'en-GB':'The Field Guide is a Basic feature', 'de':'Das Handbuch ist eine Basic-Funktion', 'fr':'Le guide est une fonction Basic', 'nl':'De veldgids is een Basic-functie', 'es':'La guía es una función Basic', 'pt-BR':'O guia é um recurso Basic', 'ja':'フィールドガイドはBasic機能です', 'ko':'필드 가이드는 Basic 기능입니다', 'zh-CN':'实用指南是 Basic 功能' },
  fg_denied_body: { 'en-US':'Upgrade to Basic to unlock the full illustrated guide to your tools, materials, and selling your quilts.', 'en-GB':'Upgrade to Basic to unlock the full illustrated guide to your tools, materials, and selling your quilts.', 'de':'Upgrade auf Basic, um den vollständig illustrierten Leitfaden zu Werkzeugen, Materialien und dem Verkauf deiner Quilts freizuschalten.', 'fr':'Passez à Basic pour débloquer le guide illustré complet sur vos outils, vos matériaux et la vente de vos quilts.', 'nl':'Upgrade naar Basic om de volledige geïllustreerde gids over gereedschap, materialen en het verkopen van je quilts te ontgrendelen.', 'es':'Mejora a Basic para desbloquear la guía ilustrada completa sobre tus herramientas, materiales y la venta de tus quilts.', 'pt-BR':'Atualize para Basic para desbloquear o guia ilustrado completo sobre ferramentas, materiais e a venda dos seus quilts.', 'ja':'Basicにアップグレードすると、道具・材料・キルトの販売についての完全イラストガイドが見られます。', 'ko':'Basic으로 업그레이드하면 도구, 재료, 퀼트 판매에 대한 전체 일러스트 가이드를 볼 수 있습니다.', 'zh-CN':'升级到 Basic 即可解锁关于工具、材料以及出售拼布作品的完整图解指南。' },
  fg_error_title: { 'en-US':'Couldn\'t load the field guide.', 'en-GB':'Couldn\'t load the field guide.', 'de':'Handbuch konnte nicht geladen werden.', 'fr':'Impossible de charger le guide.', 'nl':'Kon de veldgids niet laden.', 'es':'No se pudo cargar la guía.', 'pt-BR':'Não foi possível carregar o guia.', 'ja':'ガイドを読み込めませんでした。', 'ko':'가이드를 불러올 수 없습니다.', 'zh-CN':'无法加载指南。' },
  fg_error_body: { 'en-US':'Please close and try again.', 'en-GB':'Please close and try again.', 'de':'Bitte schließen und erneut versuchen.', 'fr':'Veuillez fermer et réessayer.', 'nl':'Sluit en probeer het opnieuw.', 'es':'Cierra e inténtalo de nuevo.', 'pt-BR':'Feche e tente novamente.', 'ja':'閉じてもう一度お試しください。', 'ko':'닫고 다시 시도하세요.', 'zh-CN':'请关闭后重试。' },
};

// ── Translate function ─────────────────────────────────────
// Usage: t('nav_home', lang)
// Falls back to en-US if key or lang not found
export function t(key, lang = 'en-US') {
  const entry = translations[key];
  if (!entry) {
    console.warn(`[i18n] Missing key: ${key}`);
    return key;
  }
  return entry[lang] || entry['en-US'] || key;
}

// ── Get all color family labels for a language ─────────────
export function getColorFamilies(lang = 'en-US') {
  const keys = ['cf_all','cf_whites','cf_yellows','cf_oranges','cf_reds','cf_pinks',
                 'cf_purples','cf_blues','cf_teals','cf_greens','cf_browns','cf_greys','cf_specialty'];
  return keys.map(k => t(k, lang));
}

// ── Get project status options for a language ──────────────
export function getProjectStatuses(lang = 'en-US') {
  return [
    t('projects_planning', lang),
    t('projects_progress', lang),
    t('projects_hold', lang),
    t('projects_complete', lang),
  ];
}
