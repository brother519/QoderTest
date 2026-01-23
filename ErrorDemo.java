public class ErrorDemo {
    
    public static void main(String[] args) {
        // 缺少分号
        int number = 10;
        
        // 类型不匹配
        String text = "123";
        
        // 未定义变量
        String undefinedVar = "defined";
        System.out.println(undefinedVar);
        
        // 方法调用括号不匹配
        printMessage("Hello");
    }
    
    public static void printMessage(String msg) {
        System.out.println(msg);
    }
}
