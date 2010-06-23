n = 0;

frequency = 16 * 2^n;
amplitude = 2048/frequency;
num = 128/frequency;
x = 0:num:127;
s = RandStream.create('mrg32k3a','Seed',num);
y = (s.rand(size(x)) - 0.5) * 2 * amplitude;
stem(x,y,'ro');
new_x0 = interp(x,num);
new_y0 = interp(y,num);
hold on;
plot(new_x0,new_y0,'k');
axis([0 128 -128 128]);
hold off;

figure;
n = 1;
frequency = 16 * 2^n;
amplitude = 2048/frequency;
num = 128/frequency;
x = 0:num:127;
s = RandStream.create('mrg32k3a','Seed',num);
y = (s.rand(size(x)) - 0.5) * 2 * amplitude;
stem(x,y,'ro');
new_x1 = interp(x,num);
new_y1 = interp(y,num);
hold on;
plot(new_x1,new_y1,'k');
axis([0 128 -128 128]);
hold off;

figure;
n = 2;
frequency = 16 * 2^n;
amplitude = 2048/frequency;
num = 128/frequency;
x = 0:num:127;
s = RandStream.create('mrg32k3a','Seed',num);
y = (s.rand(size(x)) - 0.5) * 2 * amplitude;
stem(x,y,'ro');
new_x2 = interp(x,num);
new_y2 = interp(y,num);
hold on;
plot(new_x2,new_y2,'k');
axis([0 128 -128 128]);
hold off;

figure;
new_y3 = new_y2 + new_y1 + new_y0;
stem(new_x2,new_y3,'ro');
hold on;
plot(new_x2,new_y3,'k');
axis([0 128 -128 128]);
hold off;
