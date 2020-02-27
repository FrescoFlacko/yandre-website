import React from "react"
import "./technology-section.scss"

const TechnologySection = () => (
    <section id="technology" class="about technology-section-background">
        <div class="container text-center">
            <header>
                <h2 class="text-shadow">Technology I have worked with:</h2>
            </header>
        </div>
        <div class="container">
            <div id="front-end-frameworks">
                <span>Front-end frameworks: </span>
                <span><a href="https://reactjs.org/" target="_blank">React</a></span>,&nbsp;
                <span><a href="https://angular.io/" target="_blank">Angular</a></span>,&nbsp;
                <span><a href="https://www.gatsby.org/" target="_blank">Gatsby</a></span>
            </div>
            <div id="front-end-languages">
                <span>Front-end languages: </span>
                <span><a href="https://javascript.com/" target="_blank">JavaScript</a></span>,&nbsp;
                <span><a href="https://typescriptlang.org/" target="_blank">TypeScript</a></span>,&nbsp;
                <span><a href="https://www.w3schools.com/html/" target="_blank">HTML</a></span>,&nbsp;
                <span><a href="https://www.w3schools.com/css/" target="_blank">CSS</a></span>,&nbsp;
                <span><a href="">Sass</a></span>
            </div>
            <div id="back-end-frameworks">
                <span>Back-end frameworks: </span>
                <span><a href="https://spring.io/projects/spring-boot" target="_blank">Spring Boot</a></span>,&nbsp;
                <span><a href="https://firebase.google.com/" target="_blank">Firebase</a></span>,&nbsp;
                <span><a href="https://parseplatform.org/" target="_blank">Parse</a></span>
            </div>
            <div id="back-end-languages">
                <span>Back-end languages: </span>
                <span><a href="https://www.w3schools.com/java/java_intro.asp" target="_blank">Java</a></span>
            </div>
            <div id="mobile-frameworks">
                <span>Mobile frameworks: </span>
                <span><a href="https://developer.apple.com/ios/" target="_blank">iOS SDK</a></span>,&nbsp;
                <span><a href="https://www.android.com/intl/en_ca/" target="_blank">Android</a></span>
            </div>
            <div id="mobile-languages">
                <span>Mobile languages: </span>
                <span><a href="https://developer.apple.com/swift/" target="_blank">Swift</a></span>,&nbsp;
                <span><a href="https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/Introduction/Introduction.html" target="_blank">Objective-C</a></span>,&nbsp;
                <span><a href="https://kotlinlang.org/" target="_blank">Kotlin</a></span>
            </div>
            <div id="languages">
                <span>Other languages: </span>
                <span><a href="https://www.python.org/" target="_blank">Python</a></span>,&nbsp;
                <span><a href="https://en.wikipedia.org/wiki/C_(programming_language)" target="_blank">C</a></span>,&nbsp;
                <span><a href="https://www.gnu.org/software/bash/" target="_blank">Bash</a></span>,&nbsp;
                <span><a href="https://www.json.org/" target="_blank">JSON</a></span>
            </div>
            <div id="tools">
                <span>Tools: </span>
                <span><a href="https://developer.apple.com/xcode/" target="_blank">Xcode</a></span>,&nbsp;
                <span><a href="https://developer.android.com/studio" target="_blank">Android Studio</a></span>,&nbsp;
                <span><a href="https://www.sketch.com/" target="_blank">Sketch</a></span>,&nbsp;
                <span><a href="https://visualstudio.microsoft.com/" target="_blank">Visual Studio</a></span>
            </div>
        </div>
    </section>
)

export default TechnologySection;