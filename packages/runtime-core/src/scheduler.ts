/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2022-06-07 22:34:47
 * @LastEditors: sueRimn
 * @LastEditTime: 2022-06-07 23:00:36
 */
const queue = [];
let isFlushing = false;
const resolvePromise = Promise.resolve();

export function queueJob(job) {
    if (!queue.includes(job)) {
        queue.push(job)
    }
    if (!isFlushing) {   // 批处理逻辑
        isFlushing = true
        resolvePromise.then(() => {
            isFlushing = false;
            let copy = queue.slice(0);
            queue.length = 0  // 处理，然后在执行下次拷贝操作
            for (let i = 0; i < copy.length; i++) {
                let job = copy[i];
                job();
            }

            copy.length = 0;
        })
    }
}