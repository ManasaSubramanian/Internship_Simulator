// Reference solutions for internship 4 (C++). Test suite only.
module.exports = {
  c1: `int clampAngle(int angle, int lo, int hi) {
    if (angle < lo) return lo;
    if (angle > hi) return hi;
    return angle;
}`,
  c2: `int countFaults(const int codes[], int n) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (codes[i] != 0) count++;
    }
    return count;
}`,
  c3: `int maxReading(const int a[], int n) {
    if (n <= 0) return 0;
    int best = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] > best) best = a[i];
    }
    return best;
}`,
  c4: `double lerpAngle(double from, double to, double t) {
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    return from + (to - from) * t;
}`,
  c5: `int checksum(const char msg[]) {
    int total = 0;
    for (int i = 0; msg[i] != '\\0'; i++) total += (int)msg[i];
    return total % 256;
}`,
  c6: `void smooth(const int in[], int out[], int n) {
    for (int i = 0; i < n; i++) out[i] = in[i];
    for (int i = 1; i < n - 1; i++) out[i] = (in[i - 1] + in[i] + in[i + 1]) / 3;
}`,
  c7: `bool inRange(int value, int lo, int hi) {
    return value >= lo && value <= hi;
}`,
  c8: `int binarySearch(const int a[], int n, int target) {
    int lo = 0;
    int hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
  c9: `int bitsSet(int mask) {
    int count = 0;
    while (mask) {
        count += mask & 1;
        mask >>= 1;
    }
    return count;
}`,
  c10: `int faultCode(int tempC, int currentA, bool estop) {
    if (estop) return 1;
    if (tempC > 80) return 2;
    if (currentA > 15) return 3;
    return 0;
}`,
  c11: `int filterReading(int prev, int raw, int maxJump) {
    if (abs(raw - prev) > maxJump) return prev;
    return raw;
}`,
  c12: `int missedBeats(const int t[], int n, int timeout) {
    int missed = 0;
    for (int i = 1; i < n; i++) {
        if (t[i] - t[i - 1] > timeout) missed++;
    }
    return missed;
}`,
  c13: `bool motorEnabled(int mask, int motor) {
    if (motor < 0 || motor > 15) return false;
    return (mask & (1 << motor)) != 0;
}`,
  'i-cpp1': `int factorial(int n) {
    int r = 1;
    for (int i = 2; i <= n; i++) r *= i;
    return r;
}`,
  'i-cpp2': `bool isPrime(int n) {
    if (n < 2) return false;
    for (int d = 2; d * d <= n; d++) {
        if (n % d == 0) return false;
    }
    return true;
}`,
  'i-cpp3': `int reverseDigits(int n) {
    int r = 0;
    while (n > 0) {
        r = r * 10 + n % 10;
        n /= 10;
    }
    return r;
}`,
};
