import React from "react"
import macbook from "../../bootstrap/img/hero-macbook.png";

const HeroSection = () => (
    <section id="hero" class="hero">
        <div class="container">
            <div class="row align-items-center">
                <div class="text col-lg-6 col-md-12">
                    <h3 class="h4 text-uppercase text-shadow text-thin">Mobile &amp; Web Developer</h3>
                    <h1 class="text-shadow">Yanique Andre</h1>
                    <p class="text-uppercase text-shadow text-thin">Autodidact | Polymath | Human</p>
                    <a href="#about" class="btn btn-light text-primary get-started link-scroll">About me</a>
                </div>
                <div class="mockup col-lg-6 d-none d-lg-block">
                    <img src={macbook} alt="Mockup" class="img-fluid" />
                </div>
            </div>
        </div>
    </section>
)

export default HeroSection;