interface Project {
    id:number,
    name:string,
    summary: string,
    description: string,
    tech: string[],
    gitHub: string,
    link: string,
    images: string[]
}

interface ProjectThumbNails {
    id:number,
    name: string,
    year: number,
    image: string,
}

export const Projects: Project[] = [
    {
        id: 1,
        name: "Project Name",
        summary: "",
        description: "",
        tech: [],
        gitHub: "",
        link: "",
        images:[],
    },
    {
        id: 2,
        name: "Project Name",
        summary: "",
        description: "",
        tech: [],
        gitHub: "",
        link: "",
        images:[],
    },
    {
        id: 3,
        name: "Project Name",
        summary: "",
        description: "",
        tech: [],
        gitHub: "",
        link: "",
        images:[],
    },
    {
        id: 4,
        name: "Project Name",
        summary: "",
        description: "",
        tech: [],
        gitHub: "",
        link: "",
        images:[],
    },
]

export const ProjectThumbNails: ProjectThumbNails[] = [
    {
        id:1,
        name:"AI Ecommerce Store",
        year: 2025,
        image: "/img1.png",
    },
    {
        id:2,
        name:"Yapper",
        year: 2025,
        image: "/img2.png",
    },
    {
        id:3,
        name:"Resume Builder",
        year: 2024,
        image: "/img3.png",
    },
    {
        id:4,
        name:"Scribbl",
        year: 2024,
        image: "/img4.png",
    },
    {
        id:5,
        name:"Calculator",
        year: 2024,
        image: "/img5.png",
    },

]