export class Calculator {
    private total = 0;

    add(n: number) {
        this.total += n;
    }

    getTotal() {
        return this.total;
    }
}