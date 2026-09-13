import pytest
from app.retrieval.embeddings import embedding_engine
from app.artifacts.sanitizer import sanitizer

def test_embedding_generation():
    vec = embedding_engine.generate_embedding("product strategy growth loops")
    assert len(vec) == 384
    assert isinstance(vec[0], float)

def test_cosine_similarity():
    v1 = embedding_engine.generate_embedding("product strategy")
    v2 = embedding_engine.generate_embedding("product strategy")
    sim = embedding_engine.cosine_similarity(v1, v2)
    assert round(sim, 2) == 1.0

def test_html_sanitizer_xss_protection():
    unsafe_html = """
    <div>
        <h1>Strategy Canvas</h1>
        <script>alert('XSS Hack');</script>
        <button onclick="alert('pwned')">Click me</button>
        <a href="javascript:alert('evil')">Link</a>
        <p>Grounded advice from Shreyas Doshi.</p>
    </div>
    """
    clean_html = sanitizer.sanitize(unsafe_html)
    assert "<script>" not in clean_html
    assert "alert('XSS Hack')" not in clean_html
    assert "onclick=" not in clean_html
    assert 'href="javascript:' not in clean_html
    assert "<h1>Strategy Canvas</h1>" in clean_html
    assert "Grounded advice from Shreyas Doshi." in clean_html
