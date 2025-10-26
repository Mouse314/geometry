import { Point } from "../../objects/Point.js";

// Пресеты невыпуклых многоугольников
export const PRESETS = [
    {
        name: "Са",
        points: [
            new Point(0, 0), new Point(6, 0), new Point(6, 2), new Point(2, 2), new Point(2, 6), new Point(8, 6), new Point(8, 8), new Point(0, 8)
        ]
    },
    {
        name: "Звезда",
        points: [
            new Point(0, 3), new Point(2, 3), new Point(2.5, 0), new Point(3, 3), new Point(5, 3),
            new Point(3.5, 4.5), new Point(4.5, 7), new Point(2.5, 5.5), new Point(0.5, 7), new Point(1.5, 4.5)
        ]
    },
    {
        name: "Цифра 2",
        points: [
            new Point(0, 0), new Point(4, 0), new Point(4, 2), new Point(2, 2), new Point(2, 3), new Point(4, 3), new Point(4, 8), new Point(0, 8), new Point(0, 6), new Point(2, 6), new Point(2, 5), new Point(0, 5)
        ]
    },
    {
        name: "Сложный",
        points: [
            new Point(0, 0), new Point(5, 0), new Point(6, 2), new Point(4, 3), new Point(7, 5), new Point(3, 6), new Point(5, 8), new Point(0, 7), new Point(2, 4), new Point(0, 2)
        ]
    }
];