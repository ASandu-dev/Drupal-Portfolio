<?php
/**
 * Converts Scansentinel .md articles to HTML for Drupal CKEditor import.
 *
 * Usage: php scripts/convert-articles.php
 *
 * Reads ../scansentinel/marketing/articles/*.md
 * Outputs web/sites/default/files/article-html/*.html
 *
 * Each output file:
 *   - Strips HTML comments (<!-- ... -->)
 *   - Strips YAML frontmatter (between --- markers)
 *   - Converts Markdown to HTML via League\CommonMark
 *   - Ready to paste into CKEditor Source view
 */

declare(strict_types=1);

use League\CommonMark\CommonMarkConverter;
use League\CommonMark\Environment\Environment;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\Extension\Table\TableExtension;
use League\CommonMark\MarkdownConverter;

require_once __DIR__ . '/../vendor/autoload.php';

$sourceDir = realpath(__DIR__ . '/../../scansentinel/marketing/articles');
$outputDir = __DIR__ . '/../web/sites/default/files/article-html';

if (!$sourceDir || !is_dir($sourceDir)) {
    fwrite(STDERR, "Source directory not found: $sourceDir\n");
    exit(1);
}

if (!is_dir($outputDir)) {
    mkdir($outputDir, 0755, true);
}

$config = [
    'html_input' => 'strip',
    'allow_unsafe_links' => false,
];

$environment = new Environment($config);
$environment->addExtension(new CommonMarkCoreExtension());
$environment->addExtension(new TableExtension());
$converter = new MarkdownConverter($environment);

$files = glob("$sourceDir/*.md");
$converted = 0;
$skipped = 0;

foreach ($files as $file) {
    $basename = basename($file, '.md');
    $content = file_get_contents($file);

    if ($content === false) {
        fwrite(STDERR, "Could not read: $file\n");
        $skipped++;
        continue;
    }

    // Strip HTML comments (metadata blocks)
    $content = preg_replace('/<!--.*?-->/s', '', $content);

    // Strip YAML frontmatter (between --- markers at the start)
    $content = preg_replace('/^---\s*\n.*?\n---\s*\n/s', '', $content);

    // Strip the "## Table of Contents" section (Drupal handles this differently)
    // Keep it for now, user can remove manually if desired.

    // Convert Markdown to HTML
    $html = $converter->convert($content)->getContent();

    // Wrap in a div so CKEditor can handle it cleanly
    // (No <body>/<html> tags — just the article content)
    $html = trim($html);

    $outputFile = "$outputDir/$basename.html";
    file_put_contents($outputFile, $html);
    echo "  ✓ $basename.html\n";
    $converted++;
}

echo "\nDone. $converted converted, $skipped skipped.\n";
echo "Output: $outputDir/\n";
echo "\nTo import into Drupal:\n";
echo "  1. Open the .html file\n";
echo "  2. Copy all content\n";
echo "  3. In Drupal node edit, click the 'Source' button in CKEditor\n";
echo "  4. Paste and click 'Source' again to see the rendered view\n";
echo "  5. Tables and code blocks may need minor touch-ups\n";
