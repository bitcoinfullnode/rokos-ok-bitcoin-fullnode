package nxt.util;

import org.junit.Assert;
import org.junit.Test;

import java.text.SimpleDateFormat;
import java.util.Date;

public class EpochTimeTest {

    @Test
    public void simple() {
        long time = Convert.fromEpochTime(47860355);
        Assert.assertEquals("01/06/2015 01:32:34", new SimpleDateFormat("dd/MM/yyyy hh:mm:ss").format(new Date(time)));
        Assert.assertEquals(47860355, Convert.toEpochTime(time));
    }

}
