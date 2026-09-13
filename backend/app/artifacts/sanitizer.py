import re
from typing import Dict, Any

try:
    import bleach
    HAS_BLEACH = True
except ImportError:
    HAS_BLEACH = False

class HTMLSanitizer:
    """
    Sanitizes untrusted LLM-generated HTML artifacts to protect against XSS and DOM injection attacks.
    """
    ALLOWED_TAGS = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'header', 'footer',
        'main', 'section', 'article', 'aside', 'nav', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'code', 'pre', 'blockquote',
        'strong', 'em', 'b', 'i', 'u', 'sub', 'sup', 'hr', 'br', 'a', 'img', 'svg', 'path',
        'circle', 'rect', 'line', 'polyline', 'polygon', 'style'
    ]

    ALLOWED_ATTRIBUTES = {
        '*': ['class', 'id', 'style', 'title', 'data-*'],
        'a': ['href', 'target', 'rel'],
        'img': ['src', 'alt', 'width', 'height'],
        'svg': ['viewbox', 'width', 'height', 'fill', 'stroke', 'xmlns'],
        'path': ['d', 'fill', 'stroke', 'stroke-width'],
        'td': ['colspan', 'rowspan'],
        'th': ['colspan', 'rowspan']
    }

    def sanitize(self, raw_html: str) -> str:
        if not raw_html:
            return ""

        # Remove script tags and inline event handlers regex fallback/primary
        cleaned = re.sub(r'<script[^>]*>[\s\S]*?</script>', '', raw_html, flags=re.IGNORECASE)
        cleaned = re.sub(r'on\w+\s*=\s*["\'][^"\']*["\']', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'on\w+\s*=\s*[^>\s]+', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'href\s*=\s*["\']javascript:[^"\']*["\']', 'href="#"', cleaned, flags=re.IGNORECASE)

        if HAS_BLEACH:
            try:
                cleaned = bleach.clean(
                    cleaned,
                    tags=self.ALLOWED_TAGS,
                    attributes=self.ALLOWED_ATTRIBUTES,
                    strip=True
                )
            except Exception:
                pass

        return cleaned.strip()

sanitizer = HTMLSanitizer()
