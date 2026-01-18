#!/usr/bin/env python3
"""
Internal Link Audit Script for Docusaurus Documentation
Analyzes markdown/mdx files to extract and validate internal links
"""

import os
import re
from pathlib import Path
from collections import defaultdict
from urllib.parse import urlparse, unquote
import json

class LinkAuditor:
    def __init__(self, base_dir):
        self.base_dir = Path(base_dir)
        self.docs_dir = self.base_dir / 'docs'
        self.blog_dir = self.base_dir / 'blog'

        # Data structures
        self.all_files = []
        self.outgoing_links = defaultdict(list)  # file -> list of links
        self.incoming_links = defaultdict(list)  # file -> list of files linking to it
        self.broken_links = []
        self.link_counts = {}

    def find_all_files(self):
        """Find all markdown and mdx files"""
        for directory in [self.docs_dir, self.blog_dir]:
            if directory.exists():
                for ext in ['*.md', '*.mdx']:
                    self.all_files.extend(directory.rglob(ext))
        return self.all_files

    def extract_links_from_content(self, content, current_file):
        """Extract all internal links from markdown content"""
        links = []

        # Pattern 1: Standard markdown links [text](url)
        md_links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
        for text, url in md_links:
            links.append({'text': text, 'url': url, 'type': 'markdown'})

        # Pattern 2: Reference-style links [text][ref] and [ref]: url
        ref_definitions = re.findall(r'^\[([^\]]+)\]:\s*(.+)$', content, re.MULTILINE)
        ref_dict = {ref: url for ref, url in ref_definitions}

        ref_uses = re.findall(r'\[([^\]]+)\]\[([^\]]*)\]', content)
        for text, ref in ref_uses:
            ref_key = ref if ref else text
            if ref_key in ref_dict:
                links.append({'text': text, 'url': ref_dict[ref_key], 'type': 'reference'})

        # Pattern 3: HTML anchor tags <a href="url">text</a>
        html_links = re.findall(r'<a\s+(?:[^>]*?\s+)?href=(["\'])([^"\']+)\1[^>]*>([^<]*)</a>', content, re.IGNORECASE)
        for quote, url, text in html_links:
            links.append({'text': text, 'url': url, 'type': 'html'})

        # Pattern 4: Docusaurus import statements (optional, for completeness)
        import_links = re.findall(r'import\s+.*?\s+from\s+["\']([^"\']+)["\']', content)
        for url in import_links:
            if url.startswith('.'):
                links.append({'text': 'import', 'url': url, 'type': 'import'})

        return links

    def is_internal_link(self, url):
        """Check if a link is internal (relative or anchor)"""
        # Skip external links
        if url.startswith(('http://', 'https://', 'mailto:', 'tel:', 'ftp://')):
            return False
        # Skip data URLs and other protocols
        if ':' in url and not url.startswith(('./', '../', '/')):
            return False
        # Skip pure anchor links within the same page
        if url.startswith('#'):
            return False
        return True

    def normalize_link(self, url):
        """Normalize a link by removing anchors and query strings"""
        # Remove query strings and anchors
        url = url.split('?')[0]
        url = url.split('#')[0]
        return url

    def resolve_link_path(self, source_file, link_url):
        """Resolve a relative link to an absolute file path"""
        # Normalize the link
        normalized = self.normalize_link(link_url)

        if not normalized:
            return None

        source_dir = source_file.parent

        # Handle absolute paths from docs root
        if normalized.startswith('/'):
            # Remove leading slash and resolve from base
            target = self.base_dir / normalized.lstrip('/')
        else:
            # Resolve relative path
            target = source_dir / normalized

        # Resolve to absolute path
        try:
            target = target.resolve()
        except:
            return None

        # Try different extensions if file doesn't exist
        if target.exists():
            return target

        # Try adding .md or .mdx extensions
        for ext in ['.md', '.mdx', '.markdown']:
            if (target.parent / (target.name + ext)).exists():
                return target.parent / (target.name + ext)

        # Try treating as directory and looking for index file
        if target.is_dir():
            for index_name in ['index.md', 'index.mdx', 'README.md']:
                index_file = target / index_name
                if index_file.exists():
                    return index_file

        return target

    def analyze_file(self, file_path):
        """Analyze a single file for internal links"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return

        # Extract all links
        all_links = self.extract_links_from_content(content, file_path)

        # Filter for internal links
        internal_links = []
        for link in all_links:
            url = link['url'].strip()
            if self.is_internal_link(url):
                internal_links.append(link)

                # Track outgoing link
                self.outgoing_links[str(file_path)].append({
                    'target': url,
                    'text': link['text'],
                    'type': link['type']
                })

                # Resolve the target file
                target_file = self.resolve_link_path(file_path, url)

                if target_file and target_file.exists():
                    # Track incoming link
                    self.incoming_links[str(target_file)].append(str(file_path))
                else:
                    # Track broken link
                    self.broken_links.append({
                        'source': str(file_path),
                        'target': url,
                        'text': link['text'],
                        'resolved_path': str(target_file) if target_file else 'N/A'
                    })

        # Store link count for this file
        self.link_counts[str(file_path)] = len(internal_links)

    def analyze_all(self):
        """Analyze all files"""
        print(f"Analyzing {len(self.all_files)} files...")
        for i, file_path in enumerate(self.all_files, 1):
            if i % 20 == 0:
                print(f"  Processed {i}/{len(self.all_files)} files...")
            self.analyze_file(file_path)
        print(f"Analysis complete!")

    def get_orphan_pages(self):
        """Find pages with no incoming links"""
        orphans = []
        for file_path in self.all_files:
            str_path = str(file_path)
            if str_path not in self.incoming_links or len(self.incoming_links[str_path]) == 0:
                orphans.append(str_path)
        return orphans

    def get_pages_with_few_links(self, threshold=3):
        """Find pages with fewer than threshold outgoing links"""
        few_links = {'0': [], '1': [], '2': []}
        for file_path, count in self.link_counts.items():
            if count < threshold:
                few_links[str(count)].append(file_path)
        return few_links

    def get_statistics(self):
        """Calculate link statistics"""
        if not self.link_counts:
            return {}

        counts = list(self.link_counts.values())
        return {
            'total_files': len(self.all_files),
            'total_links': sum(counts),
            'avg_links_per_file': sum(counts) / len(counts) if counts else 0,
            'min_links': min(counts) if counts else 0,
            'max_links': max(counts) if counts else 0,
            'files_with_no_links': len([c for c in counts if c == 0]),
            'files_with_1_link': len([c for c in counts if c == 1]),
            'files_with_2_links': len([c for c in counts if c == 2]),
            'total_broken_links': len(self.broken_links),
            'total_orphan_pages': len(self.get_orphan_pages())
        }

    def generate_report(self):
        """Generate comprehensive audit report"""
        stats = self.get_statistics()
        orphans = self.get_orphan_pages()
        few_links = self.get_pages_with_few_links(3)

        # Sort files by section
        docs_files = [f for f in self.all_files if '/docs/' in str(f)]
        blog_files = [f for f in self.all_files if '/blog/' in str(f)]

        # Create relative paths for readability
        def rel_path(p):
            try:
                return str(Path(p).relative_to(self.base_dir))
            except:
                return str(p)

        report = []
        report.append("# Internal Linking Audit Report\n")
        report.append(f"Generated on: {os.popen('date').read().strip()}\n")
        report.append("\n## Executive Summary\n")
        report.append(f"- **Total files analyzed**: {stats['total_files']}")
        report.append(f"  - Documentation files: {len(docs_files)}")
        report.append(f"  - Blog posts: {len(blog_files)}")
        report.append(f"- **Total internal links**: {stats['total_links']}")
        report.append(f"- **Average links per file**: {stats['avg_links_per_file']:.2f}")
        report.append(f"- **Min links in a file**: {stats['min_links']}")
        report.append(f"- **Max links in a file**: {stats['max_links']}")
        report.append(f"- **Broken internal links**: {stats['total_broken_links']}")
        report.append(f"- **Orphan pages**: {stats['total_orphan_pages']}")
        report.append(f"- **Pages with 0 links**: {stats['files_with_no_links']}")
        report.append(f"- **Pages with 1 link**: {stats['files_with_1_link']}")
        report.append(f"- **Pages with 2 links**: {stats['files_with_2_links']}")

        # Pages with insufficient links
        report.append("\n## Pages with Insufficient Internal Links (< 3)\n")
        report.append(f"**Total: {len(few_links['0']) + len(few_links['1']) + len(few_links['2'])} pages**\n")

        if few_links['0']:
            report.append(f"\n### Pages with 0 internal links ({len(few_links['0'])} pages)\n")
            docs_0 = [f for f in few_links['0'] if '/docs/' in f]
            blog_0 = [f for f in few_links['0'] if '/blog/' in f]

            if docs_0:
                report.append("\n#### Documentation Files:\n")
                for f in sorted(docs_0):
                    report.append(f"- `{rel_path(f)}`")

            if blog_0:
                report.append("\n#### Blog Posts:\n")
                for f in sorted(blog_0):
                    report.append(f"- `{rel_path(f)}`")

        if few_links['1']:
            report.append(f"\n### Pages with 1 internal link ({len(few_links['1'])} pages)\n")
            docs_1 = [f for f in few_links['1'] if '/docs/' in f]
            blog_1 = [f for f in few_links['1'] if '/blog/' in f]

            if docs_1:
                report.append("\n#### Documentation Files:\n")
                for f in sorted(docs_1):
                    links = self.outgoing_links[f]
                    link_info = f" → `{links[0]['target']}`" if links else ""
                    report.append(f"- `{rel_path(f)}`{link_info}")

            if blog_1:
                report.append("\n#### Blog Posts:\n")
                for f in sorted(blog_1):
                    links = self.outgoing_links[f]
                    link_info = f" → `{links[0]['target']}`" if links else ""
                    report.append(f"- `{rel_path(f)}`{link_info}")

        if few_links['2']:
            report.append(f"\n### Pages with 2 internal links ({len(few_links['2'])} pages)\n")
            docs_2 = [f for f in few_links['2'] if '/docs/' in f]
            blog_2 = [f for f in few_links['2'] if '/blog/' in f]

            if docs_2:
                report.append("\n#### Documentation Files:\n")
                for f in sorted(docs_2):
                    links = self.outgoing_links[f]
                    link_targets = [link['target'] for link in links]
                    report.append(f"- `{rel_path(f)}` → {link_targets}")

            if blog_2:
                report.append("\n#### Blog Posts:\n")
                for f in sorted(blog_2):
                    links = self.outgoing_links[f]
                    link_targets = [link['target'] for link in links]
                    report.append(f"- `{rel_path(f)}` → {link_targets}")

        # Orphan pages
        report.append("\n## Orphan Pages (No Incoming Links)\n")
        report.append(f"**Total: {len(orphans)} pages**\n")
        report.append("\nThese pages are not linked from any other page in the documentation.\n")

        orphan_docs = [f for f in orphans if '/docs/' in f]
        orphan_blogs = [f for f in orphans if '/blog/' in f]

        if orphan_docs:
            report.append(f"\n### Documentation Files ({len(orphan_docs)} orphans):\n")
            for f in sorted(orphan_docs):
                outgoing_count = self.link_counts.get(f, 0)
                report.append(f"- `{rel_path(f)}` (has {outgoing_count} outgoing links)")

        if orphan_blogs:
            report.append(f"\n### Blog Posts ({len(orphan_blogs)} orphans):\n")
            for f in sorted(orphan_blogs):
                outgoing_count = self.link_counts.get(f, 0)
                report.append(f"- `{rel_path(f)}` (has {outgoing_count} outgoing links)")

        # Broken links
        report.append("\n## Broken Internal Links\n")
        report.append(f"**Total: {len(self.broken_links)} broken links**\n")

        if self.broken_links:
            report.append("\nThese links point to files that don't exist:\n")

            # Group by source file
            broken_by_source = defaultdict(list)
            for broken in self.broken_links:
                broken_by_source[broken['source']].append(broken)

            for source in sorted(broken_by_source.keys()):
                report.append(f"\n### `{rel_path(source)}`\n")
                for broken in broken_by_source[source]:
                    report.append(f"- Target: `{broken['target']}` (Link text: \"{broken['text']}\")")
                    if broken['resolved_path'] != 'N/A':
                        report.append(f"  - Attempted resolution: `{rel_path(broken['resolved_path'])}`")
        else:
            report.append("\nNo broken internal links found!\n")

        # Top linked pages
        report.append("\n## Most Linked Pages (Top 20)\n")
        report.append("\nPages that receive the most incoming links:\n")

        incoming_counts = [(f, len(sources)) for f, sources in self.incoming_links.items()]
        incoming_counts.sort(key=lambda x: x[1], reverse=True)

        for file_path, count in incoming_counts[:20]:
            report.append(f"- `{rel_path(file_path)}`: **{count} incoming links**")

        # Pages with most outgoing links
        report.append("\n## Pages with Most Outgoing Links (Top 20)\n")
        report.append("\nPages that link to the most other pages:\n")

        outgoing_counts = list(self.link_counts.items())
        outgoing_counts.sort(key=lambda x: x[1], reverse=True)

        for file_path, count in outgoing_counts[:20]:
            report.append(f"- `{rel_path(file_path)}`: **{count} outgoing links**")

        # Recommendations
        report.append("\n## Recommendations\n")
        report.append("\n### Priority 1: Fix Broken Links")
        if self.broken_links:
            report.append(f"- Address {len(self.broken_links)} broken internal links")
            report.append("- Verify file paths and update links accordingly")
            report.append("- Consider setting up automated link checking in CI/CD")
        else:
            report.append("- No broken links found - great job!")

        report.append("\n### Priority 2: Connect Orphan Pages")
        if orphans:
            report.append(f"- Link to {len(orphans)} orphan pages from relevant content")
            report.append("- Consider if orphan pages should be removed or archived")
            report.append("- Add orphan pages to navigation or category indexes")
        else:
            report.append("- No orphan pages found - excellent!")

        report.append("\n### Priority 3: Enhance Internal Linking")
        total_few_links = len(few_links['0']) + len(few_links['1']) + len(few_links['2'])
        if total_few_links > 0:
            report.append(f"- Add more contextual links to {total_few_links} pages with < 3 links")
            report.append("- Link to related topics, prerequisites, and next steps")
            report.append("- Consider creating topic clusters with hub pages")

        report.append("\n### General Recommendations")
        report.append("- Target 3-5 internal links per page for better navigation")
        report.append("- Link to related documentation and tutorials")
        report.append("- Use descriptive anchor text for links")
        report.append("- Create pathway guides that link multiple related pages")
        report.append("- Add 'See also' or 'Related pages' sections to content")
        report.append("- Review high-value pages and ensure they're well-linked")

        return '\n'.join(report)

def main():
    base_dir = '/home/user/iom-docs'
    auditor = LinkAuditor(base_dir)

    # Find all files
    print("Finding all markdown files...")
    auditor.find_all_files()

    # Analyze all files
    auditor.analyze_all()

    # Generate report
    print("\nGenerating report...")
    report = auditor.generate_report()

    # Save report
    output_dir = Path(base_dir) / 'internal_docs'
    output_dir.mkdir(exist_ok=True)
    output_file = output_dir / 'internal-linking-audit-report.md'

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"\nReport saved to: {output_file}")
    print(f"\nReport summary:")
    print(f"- Total files: {len(auditor.all_files)}")
    print(f"- Total internal links: {sum(auditor.link_counts.values())}")
    print(f"- Broken links: {len(auditor.broken_links)}")
    print(f"- Orphan pages: {len(auditor.get_orphan_pages())}")

if __name__ == '__main__':
    main()
